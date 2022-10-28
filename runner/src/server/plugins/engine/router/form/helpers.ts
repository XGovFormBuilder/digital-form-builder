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
  const { form, page } = request;
  const { id } = request.params;

  if (!form) {
    throw Boom.notFound("No form found");
  }

  if (!page) {
    request.logger.debug(
      [request.yar.id],
      `page not found, redirecting to ${id}`
    );
    return h.redirect(id);
  }

  return page.makeGetRouteHandler()(request, h);
};

export const dynamicPageLookupPostHandler = async (
  request: HapiRequest,
  h: HapiResponseToolkit
) => {
  const { form, page } = request;
  const { id } = request.params;

  if (!form) {
    throw Boom.notFound("No form found");
  }

  if (!page) {
    request.logger.debug(
      [request.yar.id],
      `page not found, redirecting to ${id}`
    );
    return h.redirect(id);
  }

  return page.makePostRouteHandler()(request, h);
};
