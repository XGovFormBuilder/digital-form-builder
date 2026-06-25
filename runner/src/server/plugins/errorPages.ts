import { HapiRequest, HapiResponseToolkit } from "../types";
import config from "../config";

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

            // In the event of 404
            // return the `404` view
            if (statusCode === 404) {
              return h.view("404").code(statusCode);
            }

            request.log("error", {
              statusCode: statusCode,
              data: response.data,
              message: response.message,
            });

            try {
              const url = request.url;
              var urlPath = url.pathname.split("/");
              var form = server.app.forms[urlPath[1]];
            } catch (e) {
              return h.view("500").code(500);
            }

            // In the event of 403 (CSRF protection)
            if (statusCode === 403) {
              return h
                .view("csrf-protection", { url: urlPath[1], name: form.name })
                .code(statusCode);
            }

            // The return the `500` view
            return h
              .view("500", { name: form.name || config.serviceName })
              .code(statusCode);
          }
          return h.continue;
        }
      );
    },
  },
};
