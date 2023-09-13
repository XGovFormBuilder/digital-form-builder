import { PrismaClient, Submission } from "@xgovformbuilder/queue-model";
import { Server } from "@hapi/hapi";
import { WebhookService } from "./webhookService";
import { HapiServer } from "../types";
import { prisma } from "../../prismaClient";

export class QueueService {
  prisma: PrismaClient;
  logger: Server["logger"];
  webhookService: WebhookService;

  constructor(server: HapiServer) {
    this.prisma = prisma;
    this.logger = server.logger;
    const { webhookService } = server.services([]);
    this.webhookService = webhookService;
  }

  async openConnection() {
    await this.prisma.$connect();
  }

  async processSubmissions() {
    try {
      const rows = await this.prisma.submission.findMany({
        where: {
          error: null,
          complete: false,
          webhook_url: {
            not: null,
          },
          retry_counter: {
            lt: 5,
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
            await this.updateWithError(row, result);
            continue;
          }
          await this.updateWithSuccess(row, result);
        }
      }
    } catch (err) {
      this.logger.error(
        ["queueService", "processSubmissions"],
        (err as Error).message
      );
    }
  }

  async updateWithSuccess(row: Submission, result: any) {
    this.logger.info(
      ["QueueService", "updateWithSuccess", `row ref: ${row.id}`],
      `return ref: ${result}`
    );
    await this.prisma.submission.update({
      data: {
        return_reference: result,
        complete: true,
      },
      where: {
        id: row.id,
      },
    });
  }

  async updateWithError(row: Submission, result: any) {
    this.logger.error(
      ["QueueService", "updateWithError", `row ref: ${row.id}`],
      result
    );
    await this.prisma.submission.update({
      data: {
        error: result.message,
        retry_counter: row.retry_counter + 1,
      },
      where: {
        id: row.id,
      },
    });
    return;
  }

  async closeConnection() {
    await this.prisma.$disconnect();
  }
}
