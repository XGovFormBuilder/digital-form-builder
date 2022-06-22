import crumb from "@hapi/crumb";
import { ServerRegisterPluginObject } from "@hapi/hapi";

import { RouteConfig } from "../types";

type Config = {
  isDev: boolean;
  enforceCsrf: boolean;
};

export const configureCrumbPlugin = (
  config: Config,
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
        // skip crumb validation if error parsing payload
        const skippedRoutes = ["/session"];
        const isSkippedRoute = skippedRoutes.find((route) =>
          `${request.url}`.startsWith(route)
        );

        const isSkippedMethod =
          request.method === "post" && request.payload == null;

        if (isSkippedRoute) {
          request.logger.info(
            ["Crumb", "CSRF", "Skipping route"],
            `${request.url}`
          );
        }

        return isSkippedMethod || isSkippedRoute;
      },
    },
  };
};
