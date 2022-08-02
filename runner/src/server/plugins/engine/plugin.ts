import path from "path";
import { configure } from "nunjucks";
import { redirectTo } from "./helpers";
import { FormConfiguration } from "@xgovformbuilder/model";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "server/types";

import { FormModel } from "./models";
import Boom from "boom";
import { PluginSpecificConfiguration } from "@hapi/hapi";
import { FormPayload } from "./types";
import { shouldLogin } from "server/plugins/auth";
import config from "config";

////
//// NOTE: "DEMO SECTION"S below included for utility to
//// to enable testing of jwt's in one script
////

////
//// DEMO SECTION - creates an auth JWT
//// Test by setting:
//// export RSA256_PUBLIC_KEY_BASE64=LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZU1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTUFEQ0JpQUtCZ0hHYnRGMXlWR1crckNBRk9JZGFrVVZ3Q2Z1dgp4SEUzOGxFL2kwS1dwTXdkU0haRkZMWW5IakJWT09oMTVFaWl6WXphNEZUSlRNdkwyRTRRckxwcVlqNktFNnR2CkhyaHlQL041ZnlwU3p0OHZDajlzcFo4KzBrRnVjVzl6eU1rUHVEaXNZdG1rV0dkeEJta2QzZ3RZcDNtT0k1M1YKVkRnS2J0b0lGVTNzSWs1TkFnTUJBQUU9Ci0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==
////
const JWT = require("jsonwebtoken");
const publicBase64Secret = config.rsa256PublicKeyBase64;
let buffSecret = new Buffer(publicBase64Secret, "base64");
let secret = buffSecret.toString("ascii");
console.log(secret);
console.log(publicBase64Secret);

let privateKeyBase64 =
  "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDV3dJQkFBS0JnSEdidEYxeVZHVytyQ0FGT0lkYWtVVndDZnV2eEhFMzhsRS9pMEtXcE13ZFNIWkZGTFluCkhqQlZPT2gxNUVpaXpZemE0RlRKVE12TDJFNFFyTHBxWWo2S0U2dHZIcmh5UC9ONWZ5cFN6dDh2Q2o5c3BaOCsKMGtGdWNXOXp5TWtQdURpc1l0bWtXR2R4Qm1rZDNndFlwM21PSTUzVlZEZ0tidG9JRlUzc0lrNU5BZ01CQUFFQwpnWUJYSVhyZ1hHb2NLbk5xajNaK1lOaWZyOEVJVmhMTVhvTXJDeGdzTnNzbmZLSHhpeVBLWEJBTU02QlVzTzRuClF5MXdoUUdlSlZFUDBFUVNBem5tTXVjcldBWW9sK3ZlOTVMZ1h0ckxFV1B0ZXRxL29VL2JvcWNTRklZMmp5NDUKUDBEcUo1NTZEMmtDTXZZT3pZL1NuTHFWVU9NOEtOT2w1L0kyODUxaTFqbUlJUUpCQUxFT2tLVm5Od0c0RkhQagpVVWJRLytNakI2clpCUzlqNXZ0cHN6WnZzdjlrbWdMekkzVU5xdHY3QzBndENZNFBnMjArM1E5M2JUWUxFVXRKCnNJWGR4dGtDUVFDa1F3emFQend4ODRiUnJzT3dxUWU4MlZ0UlNGdGNPbHo2UmhpYytWOVdYTStaakNUQ1JzcVoKVDZydGNCa21zQ0l5bUVJRFJiUWUvK1dKRFQ1ZlV1S1ZBa0EwWTlycEZtRndZTWVzZ3RiSjNZM1o1OE9kQ2hvKwpxNUR0VTVsendobDArSStaejlmdUN0MUR1a1RjVm5jOVVkblJ1WWd2eTJiRlZ3RUhCZ2IxbFdvQkFrQWRkblZZCnRCenM3THhTNGVEeHorKzJYTm8zUXg0MzliUDFwQnNJRk9hWHkvL2tqN0dNTXp4bHNWZDhUUzRGdFhQODFUaUoKODdleUU3NHREZllSRFFIZEFrRUFoU2JQbFJjUVN3RW9tNTdjRlkzdFd6blJVTTNveCtCNTZ0eGxDalgxSnBpWApYUDltNzE4RnBCdFNXcSs0Z3MweUFvTHVqWnlLOUJvV3ZFbXFybTZPOFE9PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQ==";
let buffPrivateKeySecret = new Buffer(privateKeyBase64, "base64");
let privateKey = buffPrivateKeySecret.toString("ascii");
console.log(privateKey);
console.log(privateKeyBase64);
//

const authCookieKey = "fsd_user_token";
const people = {
  1: {
    accountId: 1,
    name: "Anthony Valid User",
  },
};

const token = JWT.sign(people[1], privateKey, { algorithm: "RS256" });
/////////

configure([
  // Configure Nunjucks to allow rendering of content that is revealed conditionally.
  path.resolve(__dirname, "/views"),
  path.resolve(__dirname, "/views/partials"),
  "node_modules/govuk-frontend/govuk/",
  "node_modules/govuk-frontend/govuk/components/",
  "node_modules/@xgovformbuilder/designer/views",
  "node_modules/hmpo-components/components",
]);

function normalisePath(path: string) {
  return path.replace(/^\//, "").replace(/\/$/, "");
}

function getStartPageRedirect(
  request: HapiRequest,
  h: HapiResponseToolkit,
  id: string,
  model: FormModel
) {
  const startPage = normalisePath(model.def.startPage ?? "");
  let startPageRedirect: any;

  if (startPage.startsWith("http")) {
    startPageRedirect = redirectTo(request, h, startPage);
  } else {
    startPageRedirect = redirectTo(request, h, `/${id}/${startPage}`);
  }

  return startPageRedirect;
}

type PluginOptions = {
  relativeTo?: string;
  modelOptions: any;
  configs: any[];
  previewMode: boolean;
};

export const plugin = {
  name: "@xgovformbuilder/runner/engine",
  dependencies: "@hapi/vision",
  multiple: true,
  register: (server: HapiServer, options: PluginOptions) => {
    const { modelOptions, configs, previewMode } = options;
    server.app.forms = {};
    const forms = server.app.forms;
    configs.forEach((config) => {
      forms[config.id] = new FormModel(config.configuration, {
        ...modelOptions,
        basePath: config.id,
      });
    });

    const enabledString = config.previewMode ? `[ENABLED]` : `[DISABLED]`;
    const disabledRouteDetailString =
      "A request was made however previewing is disabled. See environment variable details in runner/README.md if this error is not expected.";

    // bring your own validation function
    const validate = async function (decoded, request, h) {
      // do your checks to see if the person is valid
      if (!decoded.accountId) {
        return { isValid: false };
      } else {
        return { isValid: true };
      }
    };

    server.auth.strategy("my_jwt_strategy", "jwt", {
      // This following line should work to read a Base 64 key
      // key: Buffer.from(config.rsa256PublicKeyBase64, 'base64'),
      key: secret,
      validate,
      verifyOptions: {
        ignoreExpiration: true,
        // this needs to be uncommented to enable verification of an RSA256 signed token
        // algorithms: ["RS256"],
      },
      urlKey: false,
      cookieKey: authCookieKey,
    });

    /**
     * The following publish endpoints (/publish, /published/{id}, /published)
     * are used from the designer for operating in 'preview' mode.
     * I.E. Designs saved in the designer can be accessed in the runner for viewing.
     * The designer also uses these endpoints as a persistence mechanism for storing and retrieving data
     * for its own purposes so if you're changing these endpoints you likely need to go and amend
     * the designer too!
     */
    server.route({
      method: "post",
      path: "/publish",
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        if (!previewMode) {
          request.logger.error(
            [`POST /publish`, "previewModeError"],
            disabledRouteDetailString
          );
          throw Boom.forbidden("Publishing is disabled");
        }
        const payload = request.payload as FormPayload;
        const { id, configuration } = payload;

        const parsedConfiguration =
          typeof configuration === "string"
            ? JSON.parse(configuration)
            : configuration;
        forms[id] = new FormModel(parsedConfiguration, {
          ...modelOptions,
          basePath: id,
        });
        return h.response({}).code(204);
      },
      options: {
        description: `${enabledString} Allows a form to be persisted (published) on the runner server. Requires previewMode to be set to true. See runner/README.md for details on environment variables`,
      },
    });

    server.route({
      method: "get",
      path: "/published/{id}",
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        const { id } = request.params;
        if (!previewMode) {
          request.logger.error(
            [`GET /published/${id}`, "previewModeError"],
            disabledRouteDetailString
          );
          throw Boom.unauthorized("publishing is disabled");
        }

        const form = forms[id];
        if (!form) {
          return h.response({}).code(204);
        }

        const { values } = forms[id];
        return h.response(JSON.stringify({ id, values })).code(200);
      },
      options: {
        description: `${enabledString} Gets a published form, by form id. Requires previewMode to be set to true. See runner/README.md for details on environment variables`,
      },
    });

    server.route({
      method: "get",
      path: "/published",
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        if (!previewMode) {
          request.logger.error(
            [`GET /published`, "previewModeError"],
            disabledRouteDetailString
          );
          throw Boom.unauthorized("publishing is disabled.");
        }
        return h
          .response(
            JSON.stringify(
              Object.keys(forms).map(
                (key) =>
                  new FormConfiguration(
                    key,
                    forms[key].name,
                    undefined,
                    forms[key].def.feedback?.feedbackForm
                  )
              )
            )
          )
          .code(200);
      },
      options: {
        description: `${enabledString} Gets all published forms. Requires previewMode to be set to true. See runner/README.md for details on environment variables`,
      },
    });

    server.route({
      method: "get",
      path: "/",
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        const keys = Object.keys(forms);
        let id = "";
        if (keys.length === 1) {
          id = keys[0];
        }
        const model = forms[id];
        if (model) {
          return getStartPageRedirect(request, h, id, model);
        }
        throw Boom.notFound("No default form found");
      },
    });

    server.route({
      method: "get",
      path: "/{id}",
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        const { id } = request.params;
        const model = forms[id];
        if (model) {
          // //// DEMO SECTION - Sets an auth cookie token on this route
          // h.state(authCookieKey, token);
          // ////
          return getStartPageRedirect(request, h, id, model);
        }
        throw Boom.notFound("No form found for id");
      },
    });

    server.route({
      method: "get",
      path: "/{id}/{path*}",
      // NOTE: The following two lines apply the jwt auth strategy to this route
      // This can be applied in a similar way to any route
      options: {
        auth: "my_jwt_strategy",
      },
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        const { path, id } = request.params;
        const model = forms[id];
        const page = model?.pages.find(
          (page) => normalisePath(page.path) === normalisePath(path)
        );
        if (page) {
          // NOTE: Start pages should live on gov.uk, but this allows prototypes to include signposting about having to log in.
          if (
            page.pageDef.controller !== "./pages/start.js" &&
            shouldLogin(request)
          ) {
            return h.redirect(`/login?returnUrl=${request.path}`);
          }

          return page.makeGetRouteHandler()(request, h);
        }
        if (normalisePath(path) === "") {
          return getStartPageRedirect(request, h, id, model);
        }
        throw Boom.notFound("No form or page found");
      },
    });

    const { uploadService } = server.services([]);

    const handleFiles = (request: HapiRequest, h: HapiResponseToolkit) => {
      return uploadService.handleUploadRequest(request, h);
    };

    const postHandler = async (
      request: HapiRequest,
      h: HapiResponseToolkit
    ) => {
      const { path, id } = request.params;
      const model = forms[id];

      if (model) {
        const page = model.pages.find(
          (page) => page.path.replace(/^\//, "") === path
        );

        if (page) {
          return page.makePostRouteHandler()(request, h);
        }
      }

      throw Boom.notFound("No form of path found");
    };

    server.route({
      method: "post",
      path: "/{id}/{path*}",
      options: {
        plugins: <PluginSpecificConfiguration>{
          "hapi-rate-limit": {
            userPathLimit: 10,
          },
        },
        payload: {
          output: "stream",
          parse: true,
          multipart: { output: "stream" },
          maxBytes: uploadService.fileSizeLimit,
          failAction: async (request: any, h: HapiResponseToolkit) => {
            request.server?.plugins?.crumb?.generate?.(request, h);
            return h.continue;
          },
        },
        pre: [{ method: handleFiles }],
        handler: postHandler,
      },
    });
  },
};
