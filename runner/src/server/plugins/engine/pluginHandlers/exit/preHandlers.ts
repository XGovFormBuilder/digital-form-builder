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
export async function getStatePrehandler(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const { cacheService } = request.services([]);
  return cacheService.getState(request);
}

export async function getBacklink(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const state = request.pre.state;
  const { progress } = state;
  return progress?.at?.(-1) ?? null;
}
