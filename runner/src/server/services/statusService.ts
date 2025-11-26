import { HapiRequest, HapiServer } from "../types";
import { createHmacRaw } from "../utils/hmac";
import {
  CacheService,
  NotifyService,
  PayService,
  WebhookService,
} from "server/services";
import { SendNotificationArgs } from "server/services/notifyService";
import { Output, WebhookOutputConfiguration } from "@xgovformbuilder/model";
import type { NotifyModel } from "../plugins/engine/models/submission";
import { ComponentCollection } from "server/plugins/engine/components/ComponentCollection";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FormModel } from "server/plugins/engine/models";
import Boom from "boom";
import config from "server/config";
import nunjucks from "nunjucks";

type WebhookModel = WebhookOutputConfiguration & {
  formData: object;
};

type OutputArgs = {
  notify: SendNotificationArgs[];
  webhook: WebhookModel[];
};

type OutputModel = Output & {
  outputData: NotifyModel | WebhookModel;
};

function isWebhookModel(
  output: OutputModel["outputData"]
): output is WebhookModel {
  return (output as WebhookModel)?.url !== undefined;
}

function isNotifyModel(
  output: OutputModel["outputData"]
): output is NotifyModel {
  return (output as NotifyModel)?.emailAddress !== undefined;
}

export class StatusService {
  /**
   * StatusService handles sending data at the end of the form to the configured `Outputs`
   */
  logger: HapiServer["logger"];
  cacheService: CacheService;
  webhookService: WebhookService;
  notifyService: NotifyService;
  payService: PayService;

  constructor(server: HapiServer) {
    this.logger = server.logger;
    const {
      cacheService,
      webhookService,
      notifyService,
      payService,
    } = server.services([]);
    this.cacheService = cacheService;
    this.webhookService = webhookService;
    this.notifyService = notifyService;
    this.payService = payService;
  }
  async shouldShowPayErrorPage(request: HapiRequest): Promise<boolean> {
    const { pay } = await this.cacheService.getState(request);
    if (!pay) {
      this.logger.info(
        ["StatusService", "shouldShowPayErrorPage"],
        "No pay state detected, skipping"
      );
      return false;
    }
    const { self, meta } = pay;
    const { query } = request;
    const { state } = await this.payService.payStatus(self, meta.payApiKey);
    pay.state = state;

    if (state.status === "success") {
      this.logger.info(
        ["StatusService", "shouldShowPayErrorPage"],
        `user ${request.yar.id} - shouldShowPayErrorPage: User has succeeded, setting paymentSkipped to false and continuing`
      );

      pay.paymentSkipped = false;
      pay.state = state;
      await this.cacheService.mergeState(request, { pay });

      return false;
    }

    const form: FormModel = request.server.app.forms[request.params.id];
    const { maxAttempts, allowSubmissionWithoutPayment } = form.feeOptions;

    this.logger.info(
      ["StatusService", "shouldShowPayErrorPage"],
      `user ${request.yar.id} - shouldShowPayErrorPage: User has failed ${meta.attempts} payments`
    );

    if (!allowSubmissionWithoutPayment) {
      return true;
    }

    const userSkippedOrLimitReached =
      query?.continue === "true" || meta?.attempts >= maxAttempts;

    await this.cacheService.mergeState(request, {
      pay: {
        ...pay,
        paymentSkipped: userSkippedOrLimitReached,
      },
    });

    const shouldRetry = state.status === "failed" && !userSkippedOrLimitReached;

    this.logger.info(
      ["StatusService", "shouldShowPayErrorPage"],
      `user ${request.yar.id} - shouldShowPayErrorPage: ${shouldRetry}`
    );

    return shouldRetry;
  }

  async outputRequests(request: HapiRequest) {
    const state = await this.cacheService.getState(request);
    let formData = this.webhookArgsFromState(state);

    const { outputs, callback } = state;

    let newReference;

    /**
     * If the OPTIONAL config contains webhookHmacSharedKey, then we send HMAC Auth headers
     * This is used to confirm ONLY X-Gov's backend is sending data to our API
     * Everyone else will be Rejected
     */
    const id = request.params?.id;
    const forms = request.server?.app?.forms;
    const model = id && forms?.[id];
    const hmacKey = model?.def?.webhookHmacSharedKey;
    let customSecurityHeaders: Record<string, string> = {};

    if (hmacKey) {
      const [hmacSignature, requestTime, hmacExpiryTime] = await createHmacRaw(
        request.yar.id,
        hmacKey
      );
      customSecurityHeaders = {
        "X-Request-ID": request.yar.id.toString(),
        "X-HMAC-Signature": hmacSignature.toString(),
        "X-HMAC-Time": requestTime.toString(),
      };
    }

    if (callback) {
      this.logger.info(
        ["StatusService", "outputRequests"],
        `Callback detected for ${request.yar.id} - PUT to ${callback.callbackUrl}`
      );
      try {
        newReference = await this.webhookService.postRequest(
          callback.callbackUrl,
          formData,
          "PUT"
        );
      } catch (e) {
        throw Boom.badRequest(e);
      }
    }

    const firstWebhook = outputs?.find((output) => output.type === "webhook");
    const otherOutputs = outputs?.filter((output) => output !== firstWebhook);
    if (firstWebhook) {
      newReference = await this.webhookService.postRequest(
        firstWebhook.outputData.url,
        { ...formData },
        "POST",
        firstWebhook.outputData.sendAdditionalPayMetadata,
        customSecurityHeaders
      );
      await this.cacheService.mergeState(request, {
        reference: newReference,
      });
    }

    const { notify = [], webhook = [] } = this.outputArgs(
      otherOutputs,
      formData,
      newReference,
      state.pay,
      state.hmacSignature,
      state.hmacExpiryTime
    );

    const requests = [
      ...notify.map((args) => this.notifyService.sendNotification(args)),
      ...webhook.map(({ url, sendAdditionalPayMetadata, formData }) =>
        this.webhookService.postRequest(
          url,
          {
            ...formData,
          },
          "POST",
          sendAdditionalPayMetadata,
          customSecurityHeaders
        )
      ),
    ];

    return {
      reference: newReference,
      results: Promise.allSettled(requests),
    };
  }

  /**
   * Appends `{paymentSkipped: true}` to the `metadata` property and drops the `fees` property if the user has chosen to skip payment
   */
  webhookArgsFromState(state) {
    const { pay = {}, webhookData } = state;
    const { paymentSkipped } = pay;
    const webhookArgs = (() => {
      if (!webhookData) {
        // Handle the case when webhookData is undefined
        return {
          metadata: {
            ...state.metadata,
            paymentSkipped: paymentSkipped ?? false,
          },
        };
      }

      const { metadata, fees, ...rest } = webhookData;
      return {
        ...rest,
        ...(!paymentSkipped && { fees }),
        metadata: {
          ...metadata,
          ...state.metadata,
          paymentSkipped: paymentSkipped ?? false,
        },
      };
    })();

    if (pay) {
      webhookArgs.metadata.pay = {
        payId: pay.payId,
        reference: pay.reference,
        state: pay.state ?? {},
      };
    }

    return webhookArgs;
  }

  emailOutputsFromState(
    outputData,
    reference,
    payReference,
    hmacSignature,
    hmacExpiryTime
  ): SendNotificationArgs {
    const {
      apiKey,
      templateId,
      emailAddress,
      personalisation = {},
      addReferencesToPersonalisation = false,
      emailReplyToId,
      escapeURLs,
    } = outputData;

    return {
      personalisation: {
        ...personalisation,
        ...(addReferencesToPersonalisation && {
          hasWebhookReference: !!reference,
          webhookReference: reference || "",
          hasPaymentReference: !!payReference,
          paymentReference: payReference || "",
        }),
        hmacSignature,
        hmacExpiryTime,
      },
      reference,
      apiKey,
      templateId,
      emailAddress,
      emailReplyToId,
      escapeURLs,
    };
  }

  outputArgs(
    outputs: OutputModel[] = [],
    formData = {},
    reference,
    payReference,
    hmacSignature,
    hmacExpiryTime
  ): OutputArgs {
    this.logger.trace(["StatusService", "outputArgs"], JSON.stringify(outputs));
    return outputs.reduce<OutputArgs>(
      (previousValue: OutputArgs, currentValue: OutputModel) => {
        let { notify, webhook } = previousValue;
        if (isNotifyModel(currentValue.outputData)) {
          const args = this.emailOutputsFromState(
            currentValue.outputData,
            reference,
            payReference,
            hmacSignature,
            hmacExpiryTime
          );
          this.logger.trace(
            ["StatusService", "outputArgs", "notify"],
            JSON.stringify(args)
          );
          notify.push(args);
        }
        if (isWebhookModel(currentValue.outputData)) {
          const { url, sendAdditionalPayMetadata } = currentValue.outputData;
          webhook.push({ url, sendAdditionalPayMetadata, formData });
          this.logger.trace(
            ["StatusService", "outputArgs", "webhookArgs"],
            JSON.stringify({ url, sendAdditionalPayMetadata, formData })
          );
        }

        return { notify, webhook };
      },
      {
        notify: [],
        webhook: [],
      }
    );
  }

  getViewModel(
    state: FormSubmissionState,
    formModel: FormModel,
    newReference?: string
  ) {
    const { reference, pay, callback } = state;
    this.logger.info(
      ["StatusService", "getViewModel"],
      `generating viewModel for ${newReference ?? reference}`
    );

    const referenceToDisplay =
      newReference === "UNKNOWN" ? reference : newReference ?? reference;

    let model = {
      reference: referenceToDisplay,
      ...(pay && { paymentSkipped: pay.paymentSkipped }),
    };

    const confirmationPageDef = formModel.def.specialPages?.confirmationPage;
    if (!confirmationPageDef?.customText && !callback?.customText) {
      return model;
    }

    const customText = { ...confirmationPageDef?.customText };

    if (config.allowUserTemplates) {
      if (customText?.nextSteps) {
        customText.nextSteps = nunjucks.renderString(
          customText.nextSteps,
          state
        );
      }
      if (customText?.paymentSkipped) {
        customText.paymentSkipped = nunjucks.renderString(
          customText.paymentSkipped,
          state
        );
      }
    }

    model.customText = {
      ...customText,
      ...(callback && callback.customText),
    };

    const componentDefsToRender =
      callback?.components ?? confirmationPageDef?.components ?? [];
    const componentCollection = new ComponentCollection(
      componentDefsToRender,
      formModel
    );
    model.components = componentCollection.getViewModel(
      state,
      undefined,
      formModel.conditions
    );

    return model;
  }
}
