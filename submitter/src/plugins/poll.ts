export const pluginPoll = {
  name: "poll",
  register: async function (server, options) {
    const { queueService } = server.services;
    setInterval(async () => {
      const error = await queueService.processSubmissions();
      if (error) {
        server.error(["cron", "Process submissions"], error);
        return;
      }
      server.info(
        ["cron", "Process submissions"],
        "Submissions processed successfully"
      );
    }, options.frequency);
  },
};
