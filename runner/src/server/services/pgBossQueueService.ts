import { QueueService } from "server/services/QueueService";
type QueueResponse = [number | string, string | undefined];
import PgBoss, { JobWithMetadata } from "pg-boss";
import config from "server/config";

type QueueReferenceApiResponse = {
  reference: string;
};

type JobOutput = {
  [key: string]: any;
} & QueueReferenceApiResponse;

export class PgBossQueueService extends QueueService {
  queue: PgBoss;
  queueName: string = "submission";
  queueReferenceApiUrl: string;
  pollingInterval: number;
  pollingTimeout: number;

  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
    this.queueReferenceApiUrl = config.queueReferenceApiUrl;
    this.pollingInterval = parseInt(config.queueServicePollingInterval);
    this.pollingTimeout = parseInt(config.queueServicePollingTimeout);
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
  async getReturnRef(
    jobId: string
  ): Promise<{
    reference: string;
    state: JobWithMetadata["state"] | "JOB_NOT_FOUND";
  }> {
    let job;

    try {
      job = await this.queue.getJobById(jobId);
    } catch (e) {
      this.logger.error(
        ["PgBossQueueService", "getReturnRef"],
        `jobId: ${jobId} JOB_NOT_FOUND`
      );
      return {
        reference: "UNKNOWN",
        state: "JOB_NOT_FOUND",
      };
    }

    this.logger.info(
      ["PgBossQueueService", "getReturnRef"],
      `found job ${job.id} with state ${job.state}`
    );

    let reference = "UNKNOWN";

    if (job.state === "completed") {
      const jobOutput = job.output as JobOutput;
      reference = jobOutput?.reference;
    }

    if (job.state === "failed") {
      this.logger.info(
        ["PgBossQueueService", "getReturnRef"],
        `${jobId} failed to be processed by webhook. Returning UNKNOWN`
      );
    }

    if (!reference) {
      this.logger.info(
        ["PgBossQueueService", "getReturnRef"],
        `${jobId} was ${job.state} but the job output did not contain reference. Returning UNKNOWN`
      );
    }

    return {
      reference,
      state: job.state,
    };
  }

  async sendToQueue(
    data: object,
    url: string,
    allowRetry = true
  ): Promise<QueueResponse> {
    const logMetadata = ["QueueService", "sendToQueue"];
    const options: PgBoss.SendOptions = {
      retryBackoff: true,
    };
    if (!allowRetry) {
      options.retryLimit = 1;
    }

    let referenceNumber = "UNKNOWN";

    const jobId = await this.queue.send(
      this.queueName,
      {
        data,
        webhook_url: url,
      },
      options
    );

    if (!jobId) {
      throw Error("Job could not be created");
    }

    this.logger.info(logMetadata, `success job created with id: ${jobId}`);
    try {
      const newRowRef = await this.pollForRef(jobId);
      this.logger.info(
        logMetadata,
        `jobId: ${jobId} has reference number ${newRowRef}`
      );
      return [jobId, newRowRef ?? referenceNumber];
    } catch (e) {
      this.logger.error(
        ["QueueService", "sendToQueue", `jobId: ${jobId}`],
        `Polling for return reference failed. ${e}`
      );
      // TODO:- investigate if this should return UNKNOWN?
      return [jobId, undefined];
    }
  }

  async pollForRef(jobId: string): Promise<string | void> {
    let timeElapsed = 0;
    return new Promise(async (resolve, reject) => {
      const initialAttempt = await this.getReturnRef(jobId);
      if (
        initialAttempt.state === "completed" ||
        initialAttempt.state === "failed"
      ) {
        resolve(initialAttempt.reference);
      }

      const pollInterval = setInterval(async () => {
        try {
          const { reference, state } = await this.getReturnRef(jobId);
          if (state === "completed" || state === "failed") {
            // resolve or "exit" this loop when the job has completed or failed (i.e. do not keep polling)
            clearInterval(pollInterval);
            resolve(reference);
          }
          if (timeElapsed >= this.pollingTimeout) {
            this.logger.info(
              `jobId ${jobId} took ${timeElapsed} to reach completed or failed. Polling timeout has lapsed (${this.pollingTimeout})`
            );
            clearInterval(pollInterval);
            resolve();
          }
          timeElapsed += this.pollingInterval;
        } catch (err) {
          reject();
        }
      }, this.pollingInterval);
    });
  }
}
