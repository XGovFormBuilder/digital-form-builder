import config from "../../config";

export const pluginPoll = {
  name: "poll",
  register: async function (server, _options) {
    const { queueService } = server.services([]);
    setInterval(async () => {
      await queueService.processSubmissions();
    }, config.pollingInterval);
  },
};
