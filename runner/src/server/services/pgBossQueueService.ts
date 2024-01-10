import { QueueService } from "server/services/QueueService";
import server from "src/server";

export class PgBossQueueService extends QueueService {
  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
  }

  getReturnRef(rowId: number): Promise<string> {
    return Promise.resolve("");
  }

  pollForRef(rowId: number): Promise<string | void> {
    return Promise.resolve(undefined);
  }

  sendToQueue(
    data: object,
    url: string,
    allowRetry: boolean
  ): Promise<QueueResponse> {
    return Promise.resolve(undefined);
  }
}
