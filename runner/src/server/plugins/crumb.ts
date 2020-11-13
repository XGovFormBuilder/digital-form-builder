import crumb from "@hapi/crumb";
import { ServerRegisterPluginObject } from "@hapi/hapi";

import { RouteConfig } from "../types";

type Config = {
  sslKey: string | undefined;
  previewMode: boolean;
};

export const configureCrumbPlugin = (
  config: Config,
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
        isSecure: !!config.sslKey,
      },
      skip: (request: any) => {
        // skip crumb validation if error parsing payload
        return request.method === "post" && request.payload == null;
      },
    },
  };
};
