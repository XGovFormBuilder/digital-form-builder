import config from "../../config";

console.log(config.pollingInterval);
export const pluginPoll = {
  name: "poll",
  register: async function (server, _options) {
    const { queueService } = server.services([]);
    setInterval(async () => {
      await queueService.processSubmissions();
    }, 5000);
  },
};
