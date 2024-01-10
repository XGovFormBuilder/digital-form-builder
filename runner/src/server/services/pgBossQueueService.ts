import { QueueService } from "server/services/QueueService";
type QueueResponse = [number | string, string | undefined];
import PgBoss from "pg-boss";
import config from "server/config";

export class PgBossQueueService extends QueueService {
  queue: PgBoss | undefined;
  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
    const boss = new PgBoss(config.queueDatabaseUrl);
    boss.on("error", this.logger.error);
    boss
      .start()
      .then((boss) => {
        this.queue = boss;
      })
      .catch((e) => {
        this.logger.error(e);
        this.logger.error(
          `Connecting to ${config.queueDatabaseUrl} failed, exiting`
        );
        process.exit(1);
      });
  }

  getReturnRef(rowId: string): Promise<string> {
    return Promise.resolve("");
  }

  pollForRef(rowId: number): Promise<string | void> {
    return Promise.resolve(undefined);
  }

  sendToQueue(
    data: object,
    url: string,
    allowRetry?: boolean
  ): Promise<QueueResponse> {
    return Promise.resolve(undefined);
  }
}
