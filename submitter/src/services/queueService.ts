import { PrismaClient } from "@xgovformbuilder/queueModel";
import { Server } from "@hapi/hapi";
import { WebhookService } from "./webhookService";
import { HapiServer } from "../types";

export class QueueService {
  prisma: PrismaClient;
  logger: Server["logger"];
  webhookService: WebhookService;

  constructor(server: HapiServer) {
    this.prisma = new PrismaClient();
    this.logger = server.logger;
    const { webhookService } = server.services([]);
    this.webhookService = webhookService;
  }

  async processSubmissions() {
    try {
      const rows = await this.prisma.submission.findMany({
        where: {
          AND: {
            error: null,
            return_reference: null,
            NOT: {
              webhook_url: null,
            },
          },
        },
      });
      if (rows.length > 0) {
        for (const row of rows) {
          const error = await this.webhookService.postRequest(
            row.webhook_url as string,
            JSON.parse(row.data),
            "POST",
            row.return_reference as string
          );
          if (error) {
            this.logger.error(
              [
                "QueueService",
                "processSubmissions",
                `row ref: ${row.return_reference}`,
              ],
              error
            );
            await this.prisma.submission.update({
              data: {
                error: error.message,
              },
              where: {
                id: row.id,
              },
            });
          }
        }
      }
    } catch (err) {
      this.logger.error(
        ["queueService", "processSubmissions"],
        (err as Error).message
      );
    }
  }
}
