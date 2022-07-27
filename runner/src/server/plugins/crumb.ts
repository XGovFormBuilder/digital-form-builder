import crumb from "@hapi/crumb";
import { ServerRegisterPluginObject } from "@hapi/hapi";
import { RouteConfig } from "../types";

type Config = {
  isDev: string | undefined;
  previewMode: boolean;
};

export const configureCrumbPlugin = (
  config,
  routeConfig?: RouteConfig
): ServerRegisterPluginObject<crumb.RegisterOptions> => {
  return {
    plugin: crumb,
    options: {
      logUnauthorized: true,
      enforce: routeConfig
        ? routeConfig.enforceCsrf || false
        : !config.previewMode,
      cookieOptions: {
        path: "/",
        isSecure: !!config.isDev,
        isHttpOnly: true,
        isSameSite: "Strict",
      },
      skip: (request: any) => {
        const skippedRoutes = ["/session"];
        const isSkippedMethod =
          request.method === "post" && request.payload == null;

        const isSkippedRoute =
          skippedRoutes.find((route) => `${request.path}`.startsWith(route)) ??
          false;
        if (isSkippedRoute) {
          request.logger.info(
            ["Crumb", "CSRF", "Skipping route"],
            `${request.url}`
          );
        }

        return isSkippedMethod || !!isSkippedRoute;
      },
    },
  };
};
