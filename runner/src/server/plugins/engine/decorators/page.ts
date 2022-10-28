import { DecorationMethod } from "hapi";
import { HapiRequest } from "server/types";
import { normalisePath } from "server/plugins/engine/router/form/helpers";

/**
 * adds `page` to the request object
 * `request.form` will return the form requested based on the request's id segment.
 */
export const findPageFromRequest: DecorationMethod<HapiRequest> = (
  request: HapiRequest
) => {
  const { path } = request.params;
  const form = request.form;
  const page = form?.pages.find((page) => normalisePath(page.path) === path);
  return page;
};
