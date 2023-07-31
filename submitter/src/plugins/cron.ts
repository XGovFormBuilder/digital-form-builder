import Cron from "node-cron";

export const pluginCron = {
  name: "cron",
  register: async function (server, options) {
    const { queueService } = server.services;
    Cron.schedule(`${options.frequency ?? "*/2 * * * *"}`, async () => {
      const error = await queueService.processSubmissions();
      if (error) {
        server.error(["cron", "Process submissions"], error);
        return;
      }
      server.info(
        ["cron", "Process submissions"],
        "Submissions processed successfully"
      );
    });
  },
};
