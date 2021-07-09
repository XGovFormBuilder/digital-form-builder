import { HapiRequest, HapiServer } from "../types";
import {
  CacheService,
  NotifyService,
  PayService,
  WebhookService,
} from "server/services";
import { SendNotificationArgs } from "server/services/notifyService";
import { Output, WebhookOutputConfiguration } from "@xgovformbuilder/model";
import type { NotifyModel } from "../plugins/engine/models/submission";

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
  return (output as WebhookModel).url !== undefined;
}

function isNotifyModel(
  output: OutputModel["outputData"]
): output is NotifyModel {
  return (output as NotifyModel).emailAddress !== undefined;
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

  async shouldRetryPay(request): Promise<boolean> {
    const { pay } = await this.cacheService.getState(request);
    if (!!pay) {
      return false;
    }
    const { self, meta } = pay;
    const { query } = request;
    const { state } = await this.payService.payStatus(self, meta.payApiKey);
    const userSkippedOrLimitReached =
      query.continue === "true" || meta?.attempts === 3;

    await this.cacheService.mergeState(request, {
      pay: {
        ...pay,
        paySkipped: userSkippedOrLimitReached,
        state,
      },
    });

    return state.status !== "success" || !userSkippedOrLimitReached;
  }

  /**
   * Appends `{paymentSkipped: true}` to the `metadata` property and drops the `fees` property if the user has chosen to skip payment
   */
  webhookArgsFromState(state) {
    const { paymentSkipped, webhookData } = state;

    const { metadata, fees, ...rest } = webhookData;
    return {
      ...rest,
      ...(!paymentSkipped && { fees }),
      metadata: {
        ...metadata,
        paymentSkipped: paymentSkipped ?? false,
      },
    };
  }

  emailOutputsFromState(
    outputData,
    reference,
    payReference
  ): SendNotificationArgs {
    const {
      apiKey,
      templateId,
      emailAddress,
      personalisation = {},
      addReferencesToPersonalisation = false,
    } = outputData;

    return {
      ...personalisation,
      reference,
      apiKey,
      templateId,
      emailAddress,
      ...(addReferencesToPersonalisation && {
        hasWebhookReference: !!reference,
        webhookReference: reference || "",
        hasPaymentReference: !!payReference,
        paymentReference: payReference || "",
      }),
    };
  }

  outputArgs(
    outputs: OutputModel[] = [],
    formData = {},
    reference,
    payReference
  ): OutputArgs {
    return outputs.reduce<OutputArgs>(
      (previousValue: OutputArgs, currentValue: OutputModel) => {
        let { notify, webhook } = previousValue;
        if (isNotifyModel(currentValue.outputData)) {
          const args = this.emailOutputsFromState(
            currentValue.outputData,
            reference,
            payReference
          );
          notify.push(args);
        }
        if (isWebhookModel(currentValue.outputData)) {
          const { url } = currentValue.outputData;
          webhook.push({ url, formData });
        }

        return { notify, webhook };
      },
      {
        notify: [],
        webhook: [],
      }
    );
  }

  async outputRequests(request: HapiRequest) {
    const state = await this.cacheService.getState(request);

    const { outputs } = state;

    let newReference;

    const firstWebhook = outputs.find((output) => output.type === "webhook");
    const otherOutputs = outputs.filter((output) => output !== firstWebhook);
    let formData = this.webhookArgsFromState(state);

    if (firstWebhook) {
      newReference = await this.webhookService.postRequest(
        firstWebhook.outputData.url,
        formData
      );
      await this.cacheService.mergeState(request, {
        reference: newReference,
      });
    }

    const { notify, webhook } = this.outputArgs(
      otherOutputs,
      formData,
      newReference,
      state.pay
    );

    const requests = [
      ...notify.map((args) => this.notifyService.sendNotification(args)),
      ...webhook.map(({ url, formData }) =>
        this.webhookService.postRequest(url, formData)
      ),
    ];

    return Promise.allSettled(requests);
  }
}
