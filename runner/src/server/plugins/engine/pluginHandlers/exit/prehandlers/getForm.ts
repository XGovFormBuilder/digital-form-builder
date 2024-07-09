import { HapiRequest, HapiResponseToolkit } from "server/types";
import Boom from "boom";

export function getForm(request: HapiRequest, _h: HapiResponseToolkit) {
  const id = request.params?.id;
  const form = request.server.app.forms?.[id];
  if (!form) {
    throw Boom.notFound();
  }
  return form;
}
