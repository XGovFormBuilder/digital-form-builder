import { Plugin } from "hapi";
import { FormModel } from "server/plugins/engine/models";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import Boom from "boom";

type Config = {
  configuration: any;
  id: string;
};

export const form: Plugin<{
  config: Config;
}> = {
  name: "@xgovformbuilder/runner/form",
  dependencies: "@hapi/vision",
  multiple: true,
  register: async (server, options) => {
    const { config } = options;
    server.app.forms ??= {};
    const forms = server.app.forms;
    try {
      forms[config.id] = new FormModel(config.configuration, {
        basePath: config.id,
      });
    } catch (error) {
      server.logger.error("failed to init");
      throw new Error(`${config.id} failed to initialise`);
    }

    /**
     * You can access the form FormModel
     */
    const context = {
      form: forms[config.id],
      prefix: server.realm.modifiers.route.prefix,
      get basePath() {
        return this.prefix;
      },
    };

    server.bind(context);

    server.route({
      method: "get",
      path: "/",
      handler: (_request, h) => {
        const { form } = h.context;

        if (!form) {
          throw Boom.notFound("No form found for id");
        }

        return h.localPluginRedirect(form.startPage.path);
      },
    });

    const pages: FormModel["pages"] = context.form.pages;

    pages.forEach((page) => {
      server.route(page.makeGetRoute());
    });

    // server.route({
    //   method: "get",
    //   path: "/{path*}",
    //   handler: (request, h) => {
    //     const { path } = request.params;
    //     const model: FormModel = h.context.form;
    //
    //     const page = model?.pages.find(
    //       (page) => normalisePath(page.path) === normalisePath(path)
    //     );
    //
    //     if (!page) {
    //       if (normalisePath(path) === "") {
    //         return h.redirect(h.context.prefix);
    //       }
    //       throw Boom.notFound("No form or page found");
    //     }
    //
    //     // NOTE: Start pages should live on gov.uk, but this allows prototypes to include signposting about having to log in.
    //     if (
    //       page.pageDef.controller !== "./pages/start.js" &&
    //       shouldLogin(request)
    //     ) {
    //       return h.redirect(`/login?returnUrl=${request.path}`);
    //     }
    //
    //     return page.makeGetRouteHandler()(request, h);
    //   },
    // });

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
      path: "/{path*}",
      options: {
        plugins: {
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