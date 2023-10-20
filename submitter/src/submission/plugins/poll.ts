import config from "../../config";
import { QueueService } from "../services";

export const pluginPoll = {
  name: "poll",
  register: async function (server, _options) {
    const { queueService } = server.services([]);
    await poll(queueService);
  },
};

async function poll(queueService: QueueService) {
  const submission = await queueService.getSubmissions();
  if (!submission) {
    setTimeout(() => {
      poll(queueService);
    }, config.pollingInterval);
  } else {
    await queueService.submit(submission);
    setTimeout(() => {
      poll(queueService);
    }, config.pollingInterval);
  }
}
