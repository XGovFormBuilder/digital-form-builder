import { HapiServer } from "server/types";
import { PrismaClient } from "@xgovformbuilder/queueModel";

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
    let newRowReference;
    let timeElapsed = 0;
    const pollForRef = setInterval(async () => {
      let newRow = await this.prisma.submission.findUnique({
        select: {
          return_reference: true,
        },
        where: {
          id: row.id,
        },
      });

      if (newRow?.return_reference) {
        newRowReference = newRow.return_reference;
      }
      timeElapsed += 500;
    }, 500);
    if (timeElapsed >= 2000 || newRowReference) {
      clearInterval(pollForRef);
      await this.prisma.$disconnect();
      return [newRowReference ?? "UNKNOWN", serialisedRow.id];
    }
  }
}
