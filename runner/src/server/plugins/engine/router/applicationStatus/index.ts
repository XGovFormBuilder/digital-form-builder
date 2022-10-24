import * as handlers from "./handlers/status";
import type { Plugin } from "hapi";

export const applicationStatus: Plugin<{}> = {
  name: "applicationStatus",
  dependencies: "@hapi/vision",
  multiple: true,
  register: (server) => {
    server.route({
      method: "get",
      path: "/{id}/status",
      options: {
        pre: [
          handlers.preGet.shouldRetryPay,
          handlers.preGet.confirmationViewModel,
        ],
        handler: handlers.get,
      },
    });

    server.route({
      method: "post",
      path: "/{id}/status",
      handler: handlers.post,
    });
  },
};
