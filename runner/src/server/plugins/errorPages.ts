import { HapiRequest, HapiResponseToolkit } from "../types";

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
          const { cookies_policy: cookiesPolicy } = request.state;
          const { location } = request.app;
          const viewModel = {
            cookiesPolicy,
            location,
          };

          if ("isBoom" in response && response.isBoom) {
            // An error was raised during
            // processing the request
            const statusCode = response.output.statusCode;

            // In the event of 404
            // return the `404` view
            if (statusCode === 404) {
              return h.view("404", viewModel).code(statusCode);
            }

            request.log("error", {
              statusCode: statusCode,
              data: response.data,
              message: response.message,
            });

            // The return the `500` view
            return h.view("500", viewModel).code(statusCode);
          }
          return h.continue;
        }
      );
    },
  },
};
