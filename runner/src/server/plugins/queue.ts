import config from "server/config";
import { spawnSync } from "child_process";
const DEFAULT_OPTIONS = {
  enableQueueService: config.enableQueueService,
};
export const pluginQueue = {
  name: "queue",
  register: async function (server, _options) {
    if (DEFAULT_OPTIONS.enableQueueService) {
      const schemaLocation = require.resolve(
        "@xgovformbuilder/queue-model/schema.prisma"
      );

      const child = spawnSync(
        "prisma",
        ["migrate", "deploy", "--schema", schemaLocation],
        {
          encoding: "utf-8",
          stdio: "inherit",
        }
      );

      if (child.error) {
        server.log(["error", "queue initialisation"], child.error);
        process.exit(1);
      }
      if (child.stdout) {
        server.log(["queue initialisation", "child process"], child.stdout);
        server.log(
          ["queue initialisation"],
          "Database migration was successful, continuing"
        );
      }
    } else {
      server.log(
        ["queue initialisation"],
        "Queue service not enabled, skipping initialisation"
      );
    }
  },
};
