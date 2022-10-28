import Boom from "boom";
import { FormModel } from "server/plugins/engine/models";
import {
  HapiLifecycleMethod,
  HapiRequest,
  HapiResponseToolkit,
} from "server/types";

export function normalisePath(path: string) {
  return path?.replace(/^\//, "").replace(/\/$/, "");
}

export const dynamicPageLookupGetHandler: HapiLifecycleMethod = (
  request,
  h
) => {
  const { id, path } = request.params;
  const model: FormModel = request.server.app.forms[id];
  console.table({ id, path });

  const page = model?.pages.find((page) => normalisePath(page.path) === path);

  if (!page) {
    if (!!path) {
      return h.redirect(id);
    }
    throw Boom.notFound("No form or page found");
  }

  return page.makeGetRouteHandler()(request, h);
};

export const dynamicPageLookupPostHandler = async (
  request: HapiRequest,
  h: HapiResponseToolkit
) => {
  const { id, path } = request.params;
  const model: FormModel = request.server.app.forms[id];

  if (model) {
    const page = model.pages.find((page) => normalisePath(page.path) === path);

    if (page) {
      return page.makePostRouteHandler()(request, h);
    }
  }

  throw Boom.notFound("No form of path found");
};
