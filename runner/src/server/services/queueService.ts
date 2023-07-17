import { HapiServer } from "server/types";
import { Prisma, PrismaClient } from "@xgovformbuilder/queueModel";

export class QueueService {
  prisma: PrismaClient;
  logger: HapiServer["logger"];

  constructor(server: HapiServer) {
    this.prisma = new PrismaClient();
    this.logger = server.logger;
  }

  /**
   * Send data from output to failure queue
   * @param data
   * @param url
   * @param error
   * @returns The ID of the newly added row, or undefined in the event of an error
   */
  async sendToQueue(data: object, url?: string, error?: any) {
    const rowData = {
      data: JSON.stringify(data),
      time: new Date().getTime(),
      webhookUrl: url ?? "",
      error: JSON.stringify(error ?? {}),
      retry: 0,
    };

    try {
      await this.prisma.$connect();
      const row = await this.prisma.submission.create({
        data: rowData,
      });
      this.logger.log(
        ["queueService", "sendToQueue"],
        `Submission sent to queue successfully. Row: ${row}`
      );
      await this.prisma.$disconnect();
      return row.id;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientInitializationError) {
        this.logger.error(["queueService", "sendToQueue"], err);
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        this.logger.error(["queueService", "sendToQueue"], err);
      }
      return;
    }
  }
}
