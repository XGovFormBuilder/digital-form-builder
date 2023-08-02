import { StatusService } from "server/services/statusService";
import { HapiRequest, HapiServer } from "server/types";
import Boom from "boom";
import { QueueService } from "server/services/queueService";

export class QueueStatusService extends StatusService {
  queueService: QueueService;
  constructor(server: HapiServer) {
    super(server);
    const { queueService } = server.services([]);
    this.queueService = queueService;
  }

  async outputRequests(request: HapiRequest) {
    const state = await this.cacheService.getState(request);
    let formData = this.webhookArgsFromState(state);

    const { outputs, callback } = state;

    let newReference;
    let queueReference;

    if (callback) {
      this.logger.info(
        ["QueueStatusService", "outputRequests"],
        `Callback detected for ${request.yar.id} - PUT to ${callback.callbackUrl}`
      );
      try {
        const queueResults = await this.queueService.sendToQueue(
          formData,
          callback.callbackUrl
        );
        if (!queueResults) {
          this.logQueueServiceError();
        }
        [newReference, queueReference] = queueResults as string[];
        this.logger.info(
          ["QueueStatusService", "outputRequests"],
          `Queue reference: ${queueReference}`
        );
      } catch (e) {
        throw Boom.badRequest(e);
      }
    }

    const firstWebhook = outputs?.find((output) => output.type === "webhook");
    const otherOutputs = outputs?.filter((output) => output !== firstWebhook);
    if (firstWebhook) {
      if (!queueReference) {
        const queueResults = await this.queueService?.sendToQueue(
          formData,
          firstWebhook.outputData.url
        );
        if (!queueResults) {
          this.logQueueServiceError();
        }
        [newReference, queueReference] = queueResults as string[];
        this.logger.info(
          ["QueueStatusService", "outputRequests"],
          `Queue reference: ${queueReference}`
        );
      }
      await this.cacheService.mergeState(request, {
        reference: newReference,
      });
    }

    if (!queueReference) {
      const queueResults = await this.queueService?.sendToQueue(formData, "");
      if (!queueResults) {
        this.logQueueServiceError();
      }
      [newReference, queueReference] = queueResults as string[];
      this.logger.info(
        ["QueueStatusService", "outputRequests"],
        `Queue reference: ${queueReference}`
      );
    }

    const { notify = [], webhook = [] } = this.outputArgs(
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

    return {
      reference: newReference,
      results: Promise.allSettled(requests),
    };
  }

  logQueueServiceError() {
    this.logger.error(
      ["QueueStatusService", "outputRequests"],
      "There was an issue sending the submission to the submission queue"
    );
  }
}
