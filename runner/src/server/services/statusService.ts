import { HapiRequest, HapiServer } from "../types";
import {
  CacheService,
  NotifyService,
  PayService,
  WebhookService,
} from "server/services";
import { SendNotificationArgs } from "server/services/notifyService";

type OutputArgs = {
  notify: SendNotificationArgs[];
  webhook: { url: string; formData: object }[];
};

enum OUTPUT_TYPES {
  webhook = "webhook",
  email = "notify",
  notify = "notify",
}
/**
 * StatusService handles sending data at the end of the form to the configured `Outputs`
 */
export class StatusService {
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

  outputArgs(outputs, formData = {}, reference, payReference): OutputArgs {
    return outputs?.reduce(
      (output, acc) => {
        const type = OUTPUT_TYPES[output.type];
        if (type === OUTPUT_TYPES.notify) {
          acc.notify.push(
            this.emailOutputsFromState(
              output.outputData,
              reference,
              payReference
            )
          );
        }

        if (type === OUTPUT_TYPES.webhook) {
          const { url } = output.outputData;
          acc.webhook.push({ url, formData });
        }
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
