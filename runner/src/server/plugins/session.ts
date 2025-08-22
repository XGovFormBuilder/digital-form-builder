import config from "../config";
import generateCookiePassword from "server/utils/generateCookiePassword";

export default {
  plugin: require("@hapi/yar"),
  options: {
    cache: {
      expiresIn: config.sessionTimeout,
    },
    cookieOptions: {
      password: config.sessionCookiePassword || generateCookiePassword(),
      isSecure: config.httpsCookieSecureAttribute,
      isHttpOnly: true,
      isSameSite: "Lax",
    },
  },
};
