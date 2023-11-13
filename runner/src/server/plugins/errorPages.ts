import { HapiRequest, HapiResponseToolkit } from "../types";
import config from "server/config";

/*
 * Add an `onPreResponse` listener to return error pages
 */
export default {
  plugin: {
    name: "error-pages",
    register: (server) => {
      server.ext(
        "onPreResponse",
        (request: HapiRequest, h: HapiResponseToolkit) => {
          const response = request.response;

          if ("isBoom" in response && response.isBoom) {
            // An error was raised during
            // processing the request
            const statusCode = response.output.statusCode;
            const errorMessage = `${response.message}\n${response.stack || ""}`;

            // In the event of 404
            // return the `404` view
            if (statusCode === 404) {
              return h.view("404").code(statusCode);
            }

            // In the event of 401
            // redirect to authentication url
            if (statusCode === 401) {
              request.logger.error(errorMessage);
              return h.redirect(
                config.jwtRedirectToAuthenticationUrl +
                  "?referrer=" +
                  request.url
              );
            }

            request.log("error", {
              statusCode: statusCode,
              data: response.data,
              message: errorMessage,
            });

            // The return the `500` view
            return h.view("500").code(statusCode);
          }
          return h.continue;
        }
      );
    },
  },
};
