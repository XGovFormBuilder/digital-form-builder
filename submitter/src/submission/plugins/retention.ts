import config from "../../config";

export const pluginRetention = {
  name: "retention",
  register: async function (server, _options) {
    const { queueService } = server.services([]);
    setInterval(async () => {
      await queueService.processSubmissions();
    }, config.pollingInterval);
  },
};
