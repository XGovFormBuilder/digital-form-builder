import { QueueService } from "server/services/QueueService";
type QueueResponse = [number | string, string | undefined];
import PgBoss from "pg-boss";
import config from "server/config";

export class PgBossQueueService extends QueueService {
  queue: PgBoss;
  queueName: "submission";
  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
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

  getReturnRef(rowId: string): Promise<string> {
    return Promise.resolve("");
  }

  pollForRef(rowId: string): Promise<string | void> {
    return Promise.resolve(undefined);
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

    this.logger.info(logMetadata, `success: ${jobId}`);
    try {
      const newRowRef = await this.pollForRef(jobId);
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
