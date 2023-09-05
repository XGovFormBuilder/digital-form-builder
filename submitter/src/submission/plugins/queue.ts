import { spawnSync } from "child_process";
export const pluginQueue = {
  name: "queue",
  register: async function (server, _options) {
    const schemaLocation = require.resolve(
      "@xgovformbuilder/queueModel/schema.prisma"
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
  },
};
