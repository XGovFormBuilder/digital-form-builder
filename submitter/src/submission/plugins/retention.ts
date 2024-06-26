import config from "../../config";
import { redactSubmissions } from "../retention/redactSubmissions";
import { R_ERRORS } from "../retention/errors";
export const pluginRetention = {
  name: "retention",
  register: async function (server, _options) {
    server.route({
      method: "GET",
      path: "/retention",
      handler: async function (_req, h) {
        server.logger.info(
          `Deleting records older than ${config.retentionPeriod} days`
        );

        try {
          await redactSubmissions();
          return h.response().code(204);
        } catch (e) {
          server.error(R_ERRORS.RUN_ERROR);
          return h.response().code(400);
        }
      },
    });
  },
};
