import Boom from "boom";
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
  const { form, page } = request.pre;
  const { id } = request.params;

  const { startPage } = form;

  if (!page && !startPage) {
    request.logger.warn([request.yar.id], `page not found`);
    throw Boom.notFound(`${page} or ${startPage} not found`);
  }

  if (!page && startPage) {
    return h.redirect(`/${id}${startPage.path}`);
  }

  return page.makeGetRouteHandler()(request, h);
};

export const dynamicPageLookupPostHandler = async (
  request: HapiRequest,
  h: HapiResponseToolkit
) => {
  const { form, page } = request.pre;
  const { id } = request.params;

  if (!form) {
    throw Boom.notFound("No form found");
  }

  if (!page) {
    request.logger.debug(
      [request.yar.id],
      `page not found, redirecting to ${id}`
    );
  }

  return page.makePostRouteHandler()(request, h);
};
