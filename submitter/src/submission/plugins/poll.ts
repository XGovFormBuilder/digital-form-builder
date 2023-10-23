import config from "../../config";
import { QueueService } from "../services";
import { Logger } from "pino";

export const pluginPoll = {
  name: "poll",
  register: async function (server, _options) {
    const { queueService } = server.services([]);
    await poll(queueService, server.logger);
  },
};

async function poll(queueService: QueueService, logger: Logger) {
  const submission = await queueService.getSubmissions();
  if (!submission) {
    logger.info(["poll"], "No unprocessed submissions found. Continuing");
    setTimeout(async () => {
      await poll(queueService, logger);
    }, config.pollingInterval);
  } else {
    logger.info(
      ["poll"],
      `Unprocessed submission found. Row ref: ${submission.id}`
    );
    await queueService.submit(submission);
    await poll(queueService, logger);
  }
}
