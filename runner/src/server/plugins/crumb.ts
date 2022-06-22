import crumb from "@hapi/crumb";
import { ServerRegisterPluginObject } from "@hapi/hapi";

import { RouteConfig } from "../types";

export const configureCrumbPlugin = (
  config,
  routeConfig?: RouteConfig
): ServerRegisterPluginObject<crumb.RegisterOptions> => {
  return {
    plugin: crumb,
    options: {
      logUnauthorized: true,
      enforce: routeConfig?.enforceCsrf ?? config?.enforceCsrf,
      cookieOptions: {
        path: "/",
        isSecure: !config.isDev,
        isHttpOnly: true,
        isSameSite: "Strict",
      },
      skip: (request: any) => {
        const { safelist = [] } = config;
        const hostname = new URL(request.url).hostname;

        const isSkippedMethod =
          request.method === "post" && request.payload == null;

        const isSafelisted = safelist.includes(hostname);

        if (isSafelisted) {
          request.logger.info(
            ["Crumb", "CSRF", "Skipping safelisted origin"],
            `${request.url}`
          );
        }

        return isSkippedMethod || isSafelisted;
      },
    },
  };
};
