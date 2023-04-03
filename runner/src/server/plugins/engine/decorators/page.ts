import { DecorationMethod } from "hapi";
import { HapiRequest } from "server/types";
import { normalisePath } from "server/plugins/engine/router/form/helpers";
import Boom from "boom";

/**
 * adds `page` to the request object
 * `request.pre.page` will return the form requested based on the request's path segment.
 */
export const findPageFromRequest: DecorationMethod<HapiRequest> = (
  request: HapiRequest
) => {
  const { id, path } = request.params;
  const form = request.pre.form;

  const page = form?.pages.find((page) => normalisePath(page.path) === path);

  if (!page && !form.startPage) {
    request.logger.error(`No page or start page found for form ${id}`);
    throw Boom.notFound(`No page or start page found for form ${id}`);
  }

  return page ?? false;
};
