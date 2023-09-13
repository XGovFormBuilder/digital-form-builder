import { PrismaClient, Submission } from "@xgovformbuilder/queue-model";
import { Server } from "@hapi/hapi";
import { HapiServer } from "../types";
import { prisma } from "../../prismaClient";
import { WebhookService } from "./webhookService";

export class QueueService {
  prisma: PrismaClient;
  logger: Server["logger"];
  webhookService: WebhookService;
  MAX_RETRIES = 1000;

  constructor(server: HapiServer) {
    this.prisma = prisma;
    this.logger = server.logger;
    const { webhookService } = server.services([]);
    this.webhookService = webhookService;

    if (process.env.MAX_RETRIES) {
      try {
        this.MAX_RETRIES = parseInt(process.env.MAX_RETRIES);
      } catch (e) {
        this.logger.warn(
          `MAX_RETRIES was set to ${process.env.MAX_RETRIES} but could not be parsed. Using ${this.MAX_RETRIES} instead`
        );
      }
    }
  }

  async getSubmissions() {
    try {
      return await this.prisma.submission.findMany({
        where: {
          complete: false,
          webhook_url: {
            not: null,
          },
          retry_counter: {
            lt: this.MAX_RETRIES,
          },
        },
      });
    } catch (e) {
      this.logger.error(["queueService", "processSubmissions"], e);
      return [];
    }
  }

  async processSubmissions() {
    const submissions = await this.getSubmissions();
    this.logger.info(`Found ${submissions.length} to submit`);
    for (const row of submissions) {
      await this.submit(row);
    }
  }

  async updateWithSuccess(row: Submission, reference: string = "UNKNOWN") {
    const update = await this.prisma.submission.update({
      data: {
        return_reference: reference,
        complete: true,
      },
      where: {
        id: row.id,
        complete: false,
      },
    });

    this.logger.info(update, `${row.id} succeeded: ${reference}`);
  }

  async updateWithError(row: Submission, error) {
    this.logger.error(
      {
        rowId: row.id,
        error,
      },
      "Submission failed"
    );

    await this.prisma.submission.update({
      data: {
        error: JSON.stringify(error),
        retry_counter: {
          increment: 1,
        },
      },
      where: {
        id: row.id,
      },
    });
    return;
  }

  async submit(row) {
    try {
      const { payload } = await this.webhookService.postRequest(
        row.webhook_url,
        row.data
      );

      if (payload.error) {
        await this.updateWithError(row, payload);
      }

      if (payload.reference) {
        await this.updateWithSuccess(row, payload.reference);
      }
    } catch (err) {
      this.logger.error(`${err}`);
    }
  }
}
