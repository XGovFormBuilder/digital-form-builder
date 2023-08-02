import { HapiServer } from "server/types";
import { PrismaClient } from "@xgovformbuilder/queueModel";
import config from "../config";

export class QueueService {
  prisma: PrismaClient;
  logger: HapiServer["logger"];

  constructor(server: HapiServer) {
    this.prisma = new PrismaClient();
    this.logger = server.logger;
  }

  /**
   * Send data from form submission to submission queue
   * @param data
   * @param url
   * @returns The ID of the newly added row, or undefined in the event of an error
   */
  async sendToQueue(data: object, url?: string) {
    const rowData = {
      data: JSON.stringify(data),
      time: new Date().getTime(),
      webhook_url: url ?? "",
      complete: false,
    };
    await this.prisma.$connect();
    const row = await this.prisma.submission.create({
      data: rowData,
    });
    const serialisedRow = {
      ...row,
      time: row.time.toString(),
    };
    this.logger.info(["queueService", "sendToQueue", "success"], serialisedRow);
    try {
      const newRowRef = (await this.pollForRef(row.id)) ?? "UNKNOWN";
      this.logger.info(
        ["queueService", "sendToQueue", `Row ref: ${row.id}`],
        `Return ref: ${newRowRef}`
      );
      await this.prisma.$disconnect();
      return [newRowRef, row.id];
    } catch (err) {
      this.logger.error(
        ["QueueService", "sendToQueue", `Row ref: ${row.id}`],
        "Polling for return reference failed."
      );
      await this.prisma.$disconnect();
      return ["UNKNOWN", row.id];
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
