import path from "path";
import { configure } from "nunjucks";
import { redirectTo } from "./helpers";

import { HapiRequest, HapiResponseToolkit, HapiServer } from "server/types";

import { FormModel } from "./models";
import Boom from "boom";
import { PluginSpecificConfiguration } from "@hapi/hapi";

import { shouldLogin } from "server/plugins/auth";
import config from "config";
import { published, publish } from "./routes";
import { disabled } from "server/plugins/engine/plugins/routes/disabled";

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
    server.app.forms = {} as { [formId: string]: FormModel };
    const forms = server.app.forms as { [formId: string]: FormModel };

    configs.forEach((config) => {
      forms[config.id] = new FormModel(config.configuration, {
        ...modelOptions,
        basePath: config.id,
      });
    });

    await server.register({
      plugin: require("./plugins/publish"),
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
          return getStartPageRedirect(request, h, id, model);
        }
        throw Boom.notFound("No form found for id");
      },
    });

    server.route({
      method: "get",
      path: "/{id}/{path*}",
      handler: (request: HapiRequest, h: HapiResponseToolkit) => {
        const { path, id } = request.params;
        const model = forms[id];
        const page = model?.pages.find(
          (page) => normalisePath(page.path) === normalisePath(path)
        );

        if (!page) {
          if (normalisePath(path) === "") {
            return getStartPageRedirect(request, h, id, model);
          }
          throw Boom.notFound("No form or page found");
        }
        // NOTE: Start pages should live on gov.uk, but this allows prototypes to include signposting about having to log in.
        if (
          page.pageDef.controller !== "./pages/start.js" &&
          shouldLogin(request)
        ) {
          return h.redirect(`/login?returnUrl=${request.path}`);
        }

        return page.makeGetRouteHandler()(request, h);
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
