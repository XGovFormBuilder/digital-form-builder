import Joi from "joi";
import { redirectTo } from "./engine";
import { healthCheckRoute, publicRoutes } from "../routes";
import { HapiRequest, HapiResponseToolkit } from "../types";
import config from "../config";
import getRequestInfo from "server/utils/getRequestInfo";
import { FormModel } from "server/plugins/engine/models";
import { feedbackReturnInfoKey } from "./engine/helpers";
import { FeedbackContextInfo, RelativeUrl } from "./engine/feedback";

import fs from "fs";
import path from "path";

const routes = [...publicRoutes, healthCheckRoute];

enum CookieValue {
  Accept = "accept",
  Reject = "reject",
}

// TODO: Replace with `type Cookies = `${CookieValue}`;` when Prettier is updated to a version later than 2.2
type Cookies = "accept" | "reject";

interface CookiePayload {
  cookies: Cookies;
  crumb: string;
  referrer: string;
}

export default {
  plugin: {
    name: "router",
    register: (server) => {
      server.route(routes);
      server.route([
        {
          method: "get",
          path: "/{url}/privacy",
          handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            const { url } = _request.params; // Extract the dynamic page parameter
            const form = server.app.forms[url]; // Gain requested form context

            // Construct the file path for the view
            const viewPath = path.join(
              __dirname,
              "../views",
              url,
              "privacy.html"
            );

            // Catch the default help page before processing further
            if (url === "help") {
              return h.view("help/privacy");
            }

            // Check if the file exists
            if (!form || !fs.existsSync(viewPath)) {
              return h.redirect("/help/privacy");
            }

            const title = `${url}/privacy`;
            return h.view(title, {
              name: form.name,
              serviceName: form.def.serviceName,
              serviceStartPage: form.serviceStartPage,
              feedbackLink: feedbackUrlFromRequest(_request, form, title)
            });
          },
        },
        {
          method: "get",
          path: "/{url}/cookies",
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { url } = request.params; // Extract the dynamic page parameter
            const cookiesPolicy = request.state.cookies_policy;
            let analytics =
              cookiesPolicy?.analytics === "on" ? "accept" : "reject";

            const form = server.app.forms[url]; // Gain requested form context

            // Construct the file path for the view
            const viewPath = path.join(
              __dirname,
              "../views",
              url,
              "cookies.html"
            );

            // Catch the default help page before processing further
            if (url === "help") {
              return h.view("help/cookies");
            }

            // Check if the file exists
            if (!form || !fs.existsSync(viewPath)) {
              return h.redirect("/help/cookies");
            }

            const title = `${url}/cookies`;
            return h.view(title, {
              analytics,
              name: form.name,
              serviceName: form.def.serviceName,
              serviceStartPage: form.serviceStartPage,
              feedbackLink: feedbackUrlFromRequest(request, form, title),
              matomoUrl: form.def.analytics.matomoUrl,
              matomoId: form.def.analytics.matomoId,
              gtmId1: form.def.analytics.gtmId1,
              gtmId2: form.def.analytics.gtmId2
            });
          },
        },
        {
          method: "post",
          options: {
            payload: {
              parse: true,
              multipart: true,
              failAction: async (
                request: HapiRequest,
                h: HapiResponseToolkit
              ) => {
                request.server.plugins.crumb.generate?.(request, h);
                return h.continue;
              },
            },
            validate: {
              payload: Joi.object({
                cookies: Joi.string()
                  .valid(CookieValue.Accept, CookieValue.Reject)
                  .required(),
                crumb: Joi.string(),
              }).required(),
            },
          },
          path: "/{url}/cookies",
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { url } = request.params; // Extract the dynamic page parameter

            const { cookies } = request.payload as CookiePayload;
            const accept = cookies === "accept";

            const { referrer } = getRequestInfo(request);
            const form = server.app.forms[url]; // Gain requested form context

            // Construct the file path for the view
            const viewPath = path.join(
              __dirname,
              "../views",
              url,
              "cookies.html"
            );

            let redirectPath = `/${url}/cookies`;

            // Catch the default help page before processing further
            if (url === "help") {
              redirectPath = "help/cookies";
            }

            // Check if the file exists
            if (!form || !fs.existsSync(viewPath)) {
              redirectPath = "/help/cookies";
            }

            if (referrer) {
              redirectPath = new URL(referrer).pathname;
            }
            
            const cookieName = form?.name || `${url}Page`;

            return h.redirect(redirectPath).state(
              "cookies_policy",
              {
                isHttpOnly: false, // Set this to false so that Google tag manager can read cookie preferences
                isSet: true,
                essential: true,
                analytics: accept ? "on" : "off",
                usage: accept,
                name: cookieName,
              },
              {
                isHttpOnly: false,
                path: "/",
              }
            );
          },
        },
      ]);

      server.route({
        method: "get",
        path: "/{url}/terms-and-conditions",
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
          const { url } = _request.params; // Extract the dynamic page parameter

          const form = server.app.forms[url]; // Gain requested form context

          // Construct the file path for the view
          const viewPath = path.join(
            __dirname,
            "../views",
            url,
            "terms-and-conditions.html"
          );

          // Catch the default help page before processing further
          if (url === "help") {
            return h.view("help/terms-and-conditions");
          }

          // Check if the file exists, if it doesn't, redirect to the default accessibility statement
          if (!form || !fs.existsSync(viewPath)) {
            return h.redirect("/help/terms-and-conditions");
          }

          const title = `${url}/terms-and-conditions`;
          return h.view(title, {
            name: form.name,
            serviceName: form.def.serviceName,
            serviceStartPage: form.serviceStartPage,
            feedbackLink: feedbackUrlFromRequest(_request, form, title)
          });
        },
      });

      server.route({
        method: "get",
        path: "/{url}/accessibility-statement",
        handler: async (_request: HapiRequest, h: HapiResponseToolkit) => {
          const { url } = _request.params; // Extract the dynamic page parameter

          const form = server.app.forms[url]; // Gain requested form context

          // Construct the file path for the view
          const viewPath = path.join(
            __dirname,
            "../views",
            url,
            "accessibility-statement.html"
          );

          // Catch the default help page before processing further
          if (url === "help") {
            return h.view("help/accessibility-statement");
          }

          // Check if the file exists, if it doesn't, redirect to the default accessibility statement
          if (!form || !fs.existsSync(viewPath)) {
            return h.redirect("/help/accessibility-statement");
          }

          const title = `${url}/accessibility-statement`;
          return h.view(title, {
            name: form.name,
            serviceName: form.serviceName,
            serviceStartPage: form.serviceStartPage,
            feedbackLink: feedbackUrlFromRequest(_request, form, title)
          });
        },
      });

      server.route({
        method: "get",
        path: "/clear-session",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          if (request.yar) {
            request.yar.reset();
          }
          const { redirect } = request.query;
          return redirectTo(request, h, (redirect as string) || "/");
        },
      });

      server.route({
        method: "get",
        path: "/timeout",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          if (request.yar) {
            request.yar.reset();
          }

          let startPage = "/";

          const { referer } = request.headers;

          if (referer) {
            const match = referer.match(/https?:\/\/[^/]+\/([^/]+).*/);
            if (match && match.length > 1) {
              startPage = `/${match[1]}`;
            }
          }

          return h.view("timeout", {
            startPage,
          });
        },
      });
    },
  },
};

function feedbackUrlFromRequest(request: HapiRequest, form: FormModel, title: string): string | void {
  const feedbackUrl = (form.def.feedback?.url as any);
  if (feedbackUrl) {
    if (feedbackUrl.startsWith("http")) {
      return feedbackUrl;
    }

    const relativeFeedbackUrl = new RelativeUrl(feedbackUrl);
    const returnInfo = new FeedbackContextInfo(
      form.name,
      title,
      `${request.url.pathname}${request.url.search}`
    );
    relativeFeedbackUrl.setParam(
      feedbackReturnInfoKey,
      returnInfo.toString()
    );
    return relativeFeedbackUrl.toString();
  }

  return undefined;
}