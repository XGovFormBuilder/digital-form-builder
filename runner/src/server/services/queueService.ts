import mysql from "mysql";
import config from "server/config";
import { promisifyMysql } from "server/utils/promisifyMysql";

export class QueueService {
  connectionConfig: mysql.Connection;
  logger: any;

  constructor(logger: any) {
    this.connectionConfig = mysql.createConnection({
      host: config.queueDatabaseUrl,
      user: config.queueDatabaseUsername,
      password: config.queueDatabasePassword,
      database: "webhook_failures",
    });
    this.logger = logger;
  }

  /**
   * Send data from output to failure queue
   * @param data
   * @param url
   * @param error
   * @returns The ID of the newly added row, or undefined in the event of an error
   */
  async sendToQueue(data: object, url: string, error: any) {
    const row = {
      data: JSON.stringify(data),
      time: new Date().getTime(),
      webhookUrl: url,
      error: JSON.stringify(error),
      retry: 0,
    };

    this.connectionConfig.connect();

    const connection = promisifyMysql(this.connectionConfig);

    try {
      // language=SQL format=false
      const res: any = await connection.query(
        `INSERT INTO failures (data, time, webhook_url, error, retry)
               VALUES (:data, :time, :webhookUrl, :error, :retry)`,
        row
      );
      this.logger.info(
        ["queueService", "sendToQueue"],
        `Webhook failure sent to queue successfully. Failure id: ${res[0].id}`
      );
      await connection.close();
      return res[0].id;
    } catch (err) {
      this.logger.error(["queueService", "sendToQueue", err]);
    }
  }
}
