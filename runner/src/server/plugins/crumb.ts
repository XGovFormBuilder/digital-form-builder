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
        isSecure: config.httpsCookieSecureAttribute,
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
