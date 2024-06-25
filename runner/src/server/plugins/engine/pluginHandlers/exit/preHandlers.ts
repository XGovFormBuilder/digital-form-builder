import { HapiRequest, HapiResponseToolkit } from "server/types";
import Boom from "boom";

export function getFormPrehandler(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const id = request.params?.id;
  const form = request.server.app.forms?.[id];
  if (!form) {
    Boom.notFound();
  }
  return form;
}
