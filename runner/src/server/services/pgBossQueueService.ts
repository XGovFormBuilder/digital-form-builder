import { MySqlQueueService } from "server/services/mySqlQueueService";

export class PgBossQueueService extends MySqlQueueService {
  constructor(server) {
    super(server);
    this.logger.info("Using PGBossQueueService");
  }
}
