import config from "server/config";
import { spawnSync } from "child_process";
import { SCHEMA_LOCATION } from "@xgovformbuilder/queueModel";
const DEFAULT_OPTIONS = {
  enableQueueService: config.enableQueueService,
};
export const queue = {
  name: "queue",
  register: async function (server, options) {
    console.log(SCHEMA_LOCATION);
    const schema = require.resolve("@xgovformbuilder/queueModel/schema.prisma");

    const child = spawnSync(
      "prisma",
      ["migrate", "deploy", "--schema", schema],
      {
        encoding: "utf-8",
        stdio: "inherit",
      }
    );

    if (child.error) {
      server.error(["queue initialisation"], child.error);
      process.exit(1);
    }
    if (child.stdout) {
      server.info(child.stdout);
      server.info(
        ["queue initialisation"],
        "Database migration was successful, continuing"
      );
    }
  },
};
