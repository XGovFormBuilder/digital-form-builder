import { HapiServer } from "server/types";
import { PrismaClient } from "@xgovformbuilder/queue-model";
import { prisma } from "../prismaClient";
import config from "../config";

type QueueResponse = [number, string | undefined];
export class QueueService {
  prisma: PrismaClient;
  logger: HapiServer["logger"];
  interval: number;
  // emitter: EventEmitter;

  constructor(server: HapiServer) {
    this.prisma = prisma;
    this.logger = server.logger;
    this.interval = parseInt(config.queueServicePollingInterval);
  }

  /**
   * Send data from form submission to submission queue
   * @param data
   * @param url
   * @returns The ID of the newly added row, or undefined in the event of an error
   */
  async sendToQueue(
    data: object,
    url: string,
    allowRetry = true
  ): Promise<QueueResponse> {
    const rowData = {
      data: JSON.stringify(data),
      created_at: new Date(),
      updated_at: new Date(),
      webhook_url: url,
      complete: false,
      retry_counter: 0,
      allow_retry: allowRetry,
    };
    const row = await this.prisma.submission.create({
      data: rowData,
    });
    this.logger.info(["queueService", "sendToQueue", "success"], row);
    try {
      const newRowRef = (await this.pollForRef(row.id)) ?? "UNKNOWN";
      this.logger.info(
        ["queueService", "sendToQueue", `Row ref: ${row.id}`],
        `Return ref: ${newRowRef}`
      );
      return [row.id, newRowRef];
    } catch (err) {
      this.logger.error(
        ["QueueService", "sendToQueue", `Row ref: ${row.id}`],
        "Polling for return reference failed."
      );
      return [row.id, undefined];
    }
  }

  async pollForRef(rowId: number): Promise<string | void> {
    let timeElapsed = 0;
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const newRef = await this.getReturnRef(rowId);
          if (newRef) {
            resolve(newRef);
            clearInterval(pollInterval);
          }
          if (timeElapsed >= 2000) {
            resolve();
            clearInterval(pollInterval);
          }
          timeElapsed += parseInt(config.queueServicePollingInterval);
        } catch (err) {
          this.logger.error(
            ["QueueService", "pollForRef", `Row ref: ${rowId}`],
            err
          );
          reject();
        }
      }, config.queueServicePollingInterval);
    });
  }

  async getReturnRef(rowId: number) {
    const row = await this.prisma.submission.findUnique({
      select: {
        return_reference: true,
      },
      where: {
        id: rowId,
      },
    });
    if (!row) {
      throw new Error("Submission row not found");
    }
    return row?.return_reference;
  }
}
