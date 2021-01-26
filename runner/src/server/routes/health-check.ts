import { execSync } from "child_process";

const LAST_COMMIT = execSync("git rev-parse HEAD").toString().trim();

export default {
  method: "GET",
  path: "/heath-check",
  handler: function () {
    const date = new Date();
    return {
      status: "OK",
      lastCommit: LAST_COMMIT,
      time: date.toUTCString(),
    };
  },
};
