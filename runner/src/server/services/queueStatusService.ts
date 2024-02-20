import { StatusService } from "server/services/statusService";
import { HapiRequest, HapiServer } from "server/types";
import Boom from "boom";
import { MySqlQueueService } from "server/services/mySqlQueueService";
import { PgBossQueueService } from "server/services/pgBossQueueService";

export class QueueStatusService extends StatusService {
  queueService: MySqlQueueService | PgBossQueueService;
  constructor(server: HapiServer) {
    super(server);
    const { queueService } = server.services([]);
    this.queueService = queueService;
  }

  async outputRequests(request: HapiRequest) {
    const state = await this.cacheService.getState(request);
    let formData = this.webhookArgsFromState(state);

    const { outputs, callback } = state;

    let newReference: string | undefined;
    let queueReference: number | undefined;

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
        [queueReference, newReference] = queueResults;
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
          firstWebhook.outputData.url,
          firstWebhook.outputData.allowRetry
        );
        if (!queueResults) {
          this.logQueueServiceError();
        }
        [queueReference, newReference] = queueResults;
        this.logger.info(
          ["QueueStatusService", "outputRequests"],
          `Queue reference: ${queueReference}`
        );
      }
      await this.cacheService.mergeState(request, {
        reference: newReference ?? state.fees?.paymentReference,
      });
    }

    if (!queueReference) {
      const queueResults = await this.queueService?.sendToQueue(formData, "");
      if (!queueResults) {
        this.logQueueServiceError();
      }
      [queueReference, newReference] = queueResults;
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
      ...webhook.map(({ url, sendAdditionalMetadata, formData }) =>
        this.webhookService.postRequest(
          url,
          formData,
          "POST",
          sendAdditionalMetadata
        )
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
