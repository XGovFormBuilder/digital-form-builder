import { DecorationMethod } from "hapi";
import { HapiRequest } from "server/types";

/**
 * adds `form` to the request object
 * `request.form` will return the form requested based on the request's id segment.
 */
export const findFormFromRequest: DecorationMethod<HapiRequest> = (
  request: HapiRequest
) => {
  const { id } = request.params;

  return request.server.app.forms[id];
};
