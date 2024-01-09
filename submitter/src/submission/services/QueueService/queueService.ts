import { PrismaClient, Submission } from "@xgovformbuilder/queue-model";
import { Server } from "@hapi/hapi";
import { HapiServer } from "../../types";
import { prisma } from "../../../prismaClient";
import { WebhookService } from "./../webhookService";

const ERRORS = {
  DB_FIND_ERROR: `Q001 - Prisma (ORM) could not find submissions`,
  SUBMISSION: `Q002 - Post to webhook failed`,
  UPDATE: `Q003 - Updating DB failed`,
};

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
      const submissionRes = await this.prisma.submission.findMany({
        where: {
          complete: false,
          OR: [
            {
              allow_retry: true,
              retry_counter: {
                lt: this.MAX_RETRIES,
              },
            },
            {
              allow_retry: false,
              error: null,
            },
          ],
        },
        orderBy: [
          {
            created_at: "desc",
          },
          {
            error: { sort: "asc", nulls: "first" },
          },
        ],
        take: 1,
      });
      return submissionRes.at(0);
    } catch (e) {
      this.logger.error(
        ["queueService", "processSubmissions"],
        `${ERRORS.DB_FIND_ERROR}: ${e?.message ?? e}`
      );
      return;
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
      ERRORS.SUBMISSION
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
      this.logger.error(ERRORS.UPDATE);
    }
  }
}
