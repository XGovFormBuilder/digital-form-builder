import { QueueService } from "server/services/queueService";

export class PgBossQueueService extends QueueService {
  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
  }
}
