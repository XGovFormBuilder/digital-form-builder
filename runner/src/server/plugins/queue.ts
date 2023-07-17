import config from "server/config";
import { spawnSync } from "child_process";
import * as queueModel from "@xgovformbuilder/queueModel";

const DEFAULT_OPTIONS = {
  enableQueueService: config.enableQueueService,
};
export const queue = {
  name: "queue",
  register: async function (server, options) {
    const process = spawnSync("prisma", ["migrate", "deploy"], {
      encoding: "utf-8",
    });
    console.log(process);
  },
};
