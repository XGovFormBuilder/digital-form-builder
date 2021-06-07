import config from "../config";

/**
 * A route which helps k8s determine whether a pod managed to start successfully. If a pod is still not running, k8s will try to restart it.
 */
export default {
  method: "GET",
  path: "/health-check",
  handler: function () {
    const date = new Date();
    const uptime = process.uptime();
    return {
      status: "OK",
      lastCommit: config.lastCommit,
      lastTag: config.lastTag,
      time: date.toUTCString(),
      uptime: uptime,
    };
  },
};
