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
  async sendToQueue(data: object, url?: string) {
    const rowData = {
      data: JSON.stringify(data),
      time: new Date().getTime(),
      webhook_url: url ?? "",
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
    await this.prisma.$disconnect();
    return serialisedRow.id;
  }
}
