import { QueueService } from "server/services/QueueService";
type QueueResponse = [number | string, string | undefined];
import PgBoss from "pg-boss";
import config from "server/config";
import { get } from "./httpService";

type QueueReferenceApiResponse = {
  reference: string;
};

export class PgBossQueueService extends QueueService {
  queue: PgBoss;
  queueName: string = "submission";
  queueReferenceApiUrl: string;
  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
    this.queueReferenceApiUrl = config.queueReferenceApiUrl;
    const boss = new PgBoss(config.queueDatabaseUrl);
    this.queue = boss;
    boss.on("error", this.logger.error);
    boss.start().catch((e) => {
      this.logger.error(
        `Connecting to ${config.queueDatabaseUrl} failed, exiting`
      );
      throw e;
    });
  }

  /**
   * Fetches a reference number from `this.queueReferenceApiUrl/{jobId}`.
   * If a reference number for `jobId` exists, the response body must be {@link QueueReferenceApiResponse}.
   * This request will happen once, and timeout in 2s.
   */
  async getReturnRef(jobId: string): Promise<string> {
    const url = `${this.queueReferenceApiUrl}/${jobId}`;
    const { res, payload, error } = await get(url, {
      path: jobId,
      timeout: 2000,
      json: true,
    });
    this.logger.info(
      ["PgBossQueueService", "getReturnRef"],
      `GET to ${url} responded with ${res.statusCode}`
    );
    if (error) {
      this.logger.error(error);
      throw error;
    }
    const reference = payload.reference;
    if (!reference) {
      this.logger.info(
        ["PgBossQueueService", "getReturnRef"],
        `GET to ${url} was successful but the response body did not contain reference. Returning UNKNOWN`
      );
    }
    return reference ?? "UNKNOWN";
  }

  async sendToQueue(
    data: object,
    url: string,
    allowRetry = true
  ): Promise<QueueResponse> {
    const logMetadata = ["QueueService", "sendToQueue"];
    const options: PgBoss.SendOptions = {};
    if (!allowRetry) {
      options.retryLimit = 1;
    }

    let referenceNumber = "UNKNOWN";

    const jobId = await this.queue.send(this.queueName, {
      data,
      webhook_url: url,
    });

    if (!jobId) {
      throw Error("Job could not be created");
    }

    this.logger.info(logMetadata, `success job created with id: ${jobId}`);
    try {
      const newRowRef = await this.getReturnRef(jobId);
      this.logger.info(
        logMetadata,
        `jobId: ${jobId} has reference number ${newRowRef}`
      );
      return [jobId, newRowRef ?? referenceNumber];
    } catch {
      this.logger.error(
        ["QueueService", "sendToQueue", `jobId: ${jobId}`],
        "Polling for return reference failed."
      );
      // TODO:- investigate if this should return UNKNOWN?
      return [jobId, undefined];
    }
  }
}
