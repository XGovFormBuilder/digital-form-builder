import config from "../config";
import yar from "yar";
import { ServerRegisterPluginObject } from "@hapi/hapi";

export const configureYarPlugin = (): ServerRegisterPluginObject<yar> => {
  return {
    plugin: yar,
    options: {
      cache: {
        expiresIn: config.sessionTimeout,
      },
      cookieOptions: {
        password:
          config.sessionCookiePassword ||
          Array(32)
            .fill(0)
            .map(() => Math.random().toString(36).charAt(2))
            .join(""),
        isSecure: config.isProd,
        isHttpOnly: true,
        isSameSite: "Lax",
      },
    },
  };
};
