import config from "../config";
import yar from "yar";

export default {
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
      isSecure: !!config.isDev,
      isHttpOnly: true,
      isSameSite: "Lax",
    },
  },
};
