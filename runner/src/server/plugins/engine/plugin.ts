import path from "path";
import { configure } from "nunjucks";
import { idFromFilename, redirectTo } from "./helpers";

import { HapiRequest, HapiResponseToolkit } from "server/types";

import { FormModel } from "./models";
import Boom from "boom";

import { Plugin } from "hapi";
import { form } from "./router/form";
import { plugin as publishPlugin } from "./router/publish";
import { FormDefinition } from "@xgovformbuilder/model";
import {
  dynamicPageLookupGetHandler,
  dynamicPageLookupPostHandler,
} from "server/plugins/engine/router/form/helpers";

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

//TODO:- refactor using h.redirectLocal
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

/**
 * @deprecated
 * Loads a form json from the provided fileName and path.
 * This will be deprecated in a future release, to resolve first load your file(s)
 * Load your JSON file and use the configs option instead.
 * ```
 * configs: [
 *   configuration: require(yourFile),
 *   id: "the-form-name"
 * ]
 * ```
 */
function loadFormPathAsConfigOption(
  formFileName: string,
  formFilePath: string
): PluginOptions["configs"] {
  return [
    {
      configuration: require(path.join(formFilePath, formFileName)),
      id: idFromFilename(formFileName),
    },
  ];
}

type PluginOptions = {
  relativeTo?: string;
  formFileName?: string;
  formFilePath?: string;
  configs?: {
    configuration: FormDefinition;
    id: string;
  }[];
};
export const plugin: Plugin<PluginOptions> = {
  name: "@xgovformbuilder/runner/engine",
  dependencies: "@hapi/vision",
  multiple: true,
  register: async (server, options) => {
    const { configs = [], formFileName, formFilePath } = options;

    let formsToUse: Required<PluginOptions["configs"]> = configs ?? [];

    if (formFileName && formFilePath) {
      server.logger.warn(
        `
          formFileName and formFilePath will become deprecated options in later releases.
          Load your JSON file and use the configs option instead.
          configs: [
            configuration: require(yourFile),
            id: "the-form-name"
          ]
        `
      );
      formsToUse =
        loadFormPathAsConfigOption(formFileName, formFilePath) ?? configs;
    }

    server.app.forms ??= {};
    const forms = server.app.forms;

    /**
     * /publish and /published routes
     */
    await server.register(publishPlugin);

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

    formsToUse.forEach((config) => {
      server.register(
        {
          plugin: form,
          options: {
            config: config,
          },
        },
        {
          routes: {
            prefix: `/${config.id}`,
          },
        }
      );
    });

    server.route({
      method: "get",
      path: "/{id}/{path*}",
      handler: dynamicPageLookupGetHandler,
    });

    server.route({
      method: "post",
      path: "/{id}/{path*}",
      handler: dynamicPageLookupPostHandler,
      options: {
        payload: {
          multipart: {
            output: "data",
          },
        },
      },
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
