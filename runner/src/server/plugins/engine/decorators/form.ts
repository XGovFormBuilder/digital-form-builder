import { HapiLifecycleMethod, HapiRequest } from "server/types";
import Boom from "boom";

/**
 * adds `form` to the request object
 * `request.pre.form` will return the form requested based on the request's id segment.
 */
export const findFormFromRequest: HapiLifecycleMethod = (
  request: HapiRequest
) => {
  const { id } = request.params;
  const form = request.server.app.forms[id];

  if (!form) {
    throw Boom.notFound("No form found");
  }

  return form;
};
