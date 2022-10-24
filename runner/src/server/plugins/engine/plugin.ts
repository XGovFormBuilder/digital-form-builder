import path from "path";
import { configure } from "nunjucks";
import { redirectTo } from "./helpers";

import { HapiRequest, HapiResponseToolkit } from "server/types";

import { FormModel } from "./models";
import Boom from "boom";

import { Plugin } from "hapi";
import { form } from "./router/form";

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
  previewMode: boolean;
  modelOptions: {
    relativeTo: string;
    previewMode: any;
  };
  configs: {
    configuration: any;
    id: string;
  }[];
};

export const plugin: Plugin<PluginOptions> = {
  name: "@xgovformbuilder/runner/engine",
  dependencies: "@hapi/vision",
  multiple: true,
  register: async (server, options) => {
    const { modelOptions, configs } = options;
    server.app.forms = {};
    const forms = server.app.forms;

    /**
     * /publish and /published routes
     */
    await server.register({
      plugin: require("./routes/publish"),
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

    configs.forEach((config) => {
      server.register(
        {
          plugin: form,
          options: {
            config: config,
            modelOptions,
          },
        },
        {
          routes: {
            prefix: `/${config.id}`,
          },
        }
      );
    });

    /**
     * Adds localPluginRedirect to the response toolkit `h`.
     * Prepends the plugin's prefix to h.redirect.
     * @example `h.localPluginRedirect('new-location')` redirects to /test/new-location
     * {@link https://hapi.dev/api/?v=21.0.0-beta.1#response-toolkit}
     */
    server.decorate("toolkit", "localPluginRedirect", function (uri: string) {
      const prefix = this.context.prefix ?? "";
      this.request.logger.trace(
        ["localPluginRedirect", "redirect"],
        `prefixing ${prefix} to h.redirect(${uri})`
      );

      return this.redirect(path.join(prefix, uri));
    });
  },
};
