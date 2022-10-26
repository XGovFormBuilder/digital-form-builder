import Boom from "boom";
import { FormModel } from "server/plugins/engine/models";
import { HapiLifecycleMethod } from "server/types";

export function normalisePath(path: string) {
  return path.replace(/^\//, "").replace(/\/$/, "");
}

export const dynamicPageLookupHandler: HapiLifecycleMethod = (request, h) => {
  const { path } = request.params;
  const model: FormModel = h.context.form;

  const page = model?.pages.find(
    (page) => normalisePath(page.path) === normalisePath(path)
  );

  if (!page) {
    if (normalisePath(path) === "") {
      return h.redirect(h.context.prefix);
    }
    throw Boom.notFound("No form or page found");
  }

  return page.makeGetRouteHandler()(request, h);
};
