import { post, put } from "./httpService";
import { HapiServer } from "../types";
import config from "../config";
import mysql from "mysql";
import { promisifyMysql } from "server/utils/promisifyMysql";

const DEFAULT_OPTIONS = {
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
  timeout: 60000,
};

export class WebhookService {
  logger: any;
  dbConnection: mysql.Connection | undefined;
  constructor(server: HapiServer) {
    this.logger = server.logger;
    if (config.enableQueueService) {
      this.dbConnection = mysql.createConnection({
        host: config.queueDatabaseUrl,
        user: "root",
        password: config.queueDatabasePassword,
        database: "webhook_failures",
      });
    }
  }

  /**
   * Posts data to a webhook
   * @param url - url of the webhook
   * @param data - object to send to the webhook
   * @param method - POST or PUT request, defaults to POST
   * @returns object with the property `reference` webhook if the response returns with a reference number. If the call fails, the reference will be 'UNKNOWN'.
   */
  async postRequest(
    url: string,
    data: object,
    method: "POST" | "PUT" = "POST"
  ) {
    this.logger.info(
      ["WebhookService", "postRequest body"],
      JSON.stringify(data)
    );
    let request = method === "POST" ? post : put;

    const { payload } = await request(url, {
      ...DEFAULT_OPTIONS,
      payload: JSON.stringify(data),
    });

    if (typeof payload === "object" && !Buffer.isBuffer(payload)) {
      return payload.reference;
    }

    try {
      const { reference } = JSON.parse(payload);
      this.logger.info(
        ["WebhookService", "postRequest"],
        `Webhook request to ${url} submitted OK`
      );
      this.logger.debug(
        ["WebhookService", "postRequest", `REF: ${reference}`],
        JSON.stringify(payload)
      );
      return reference;
    } catch (error) {
      this.logger.error(["WebhookService", "postRequest"], error);
      if (config.enableQueueService) {
        const res = this.sendToFailureQueue(data, url, error);
        if (!res) {
          this.logger.error(
            ["WebhookService", "postRequest"],
            "There was an issue sending the failure to the failure queue"
          );
        }
      }
      return "UNKNOWN";
    }
  }

  /**
   * Send a failed webhook's data to a queue for retrying
   * @param data
   * @param url
   * @param error
   * @private
   * @returns the id of the newly added row to the DB, or undefined if there was an error
   */
  private async sendToFailureQueue(data: object, url: string, error: any) {
    if (!this.dbConnection) {
      this.logger.error(
        ["WebhookService", "sendToFailureQueue"],
        "Could not add failure to failure queue: No DB connection found"
      );
      return undefined;
    }
    const row = {
      data: JSON.stringify(data),
      time: new Date().getTime(),
      webhookUrl: url,
      error: JSON.stringify(error),
      retry: 0,
    };

    this.dbConnection.connect();

    const connection = promisifyMysql(this.dbConnection);

    try {
      // language=SQL format=false
      const res: any = await connection.query(
        `INSERT INTO failures (data, time, webhook_url, error, retry)
               VALUES (:data, :time, :webhookUrl, :error, :retry)`,
        row
      );
      this.logger.info(
        ["webhookService", "sendToFailureQueue"],
        `Webhook failure sent to queue successfully. Failure id: ${res[0].id}`
      );
      return res[0].id;
    } catch (err) {
      this.logger.error(["webhookService", "sendToFailureQueue", err]);
    }
  }
}
