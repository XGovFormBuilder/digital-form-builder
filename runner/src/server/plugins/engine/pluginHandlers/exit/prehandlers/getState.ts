import { HapiRequest, HapiResponseToolkit } from "server/types";

export async function getState(request: HapiRequest, _h: HapiResponseToolkit) {
  const { cacheService } = request.services([]);
  return cacheService.getState(request);
}
