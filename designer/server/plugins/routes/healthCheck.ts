import { execSync } from "child_process";
import { ServerRoute } from "@hapi/hapi";

const LAST_COMMIT = execSync("git rev-parse HEAD").toString().trim();
const LAST_TAG = execSync("git describe --tags --abbrev=0").toString().trim();

export const healthCheckRoute: ServerRoute = {
  method: "GET",
  path: "/health-check",
  handler: function () {
    const date = new Date();

    return {
      status: "OK",
      lastCommit: LAST_COMMIT,
      lastTag: LAST_TAG,
      time: date.toUTCString(),
    };
  },
};
