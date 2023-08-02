import config from "../config";

export const pluginPoll = {
  name: "poll",
  register: async function (server, _options) {
    const { queueService } = server.services([]);
    setInterval(async () => {
      const error = await queueService.processSubmissions();
      if (error) {
        server.error(["poll", "Process submissions"], error);
        return;
      } else {
        server.log(
          ["poll", "Process submissions"],
          "Submissions processed successfully"
        );
      }
    }, config.pollingInterval);
  },
};
