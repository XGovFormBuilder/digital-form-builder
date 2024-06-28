import HapiCron from "hapi-cron";
import pino from "pino";
const logger = pino();
export const pluginRetentionCron = {
  plugin: HapiCron,
  options: {
    jobs: [
      {
        name: "retention-cron",
        time: "*/1 * * * *",
        timezone: "Europe/London",
        request: {
          method: "GET",
          url: "/retention",
        },
        onComplete: () => {
          logger.info("retention-cron complete");
        },
      },
    ],
  },
};
