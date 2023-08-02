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
      await this.prisma.$connect();
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
          const result = await this.webhookService.postRequest(
            row.webhook_url as string,
            JSON.parse(row.data),
            "POST"
          );
          if (result.message) {
            this.logger.error(
              ["QueueService", "processSubmissions", `row ref: ${row.id}`],
              result
            );
            await this.prisma.submission.update({
              data: {
                error: result.message,
              },
              where: {
                id: row.id,
              },
            });
            continue;
          }
          this.logger.info(
            ["QueueService", "processSubmissions", `row ref: ${row.id}`],
            `return ref: ${result}`
          );
          await this.prisma.submission.update({
            data: {
              return_reference: result,
            },
            where: {
              id: row.id,
            },
          });
        }
      }
    } catch (err) {
      this.logger.error(
        ["queueService", "processSubmissions"],
        (err as Error).message
      );
    }
  }

  async closeConnection() {
    await this.prisma.$disconnect();
  }
}
