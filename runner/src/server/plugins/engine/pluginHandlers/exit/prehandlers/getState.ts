import { HapiRequest, HapiResponseToolkit } from "server/types";

/**
 * Utility prehandler to get the user's state at the time the request was invoked.
 * (cacheService.getState will need to be called again if their state has been updated in later prehandlers or handlers)
 */
export async function getState(request: HapiRequest, _h: HapiResponseToolkit) {
  const { cacheService } = request.services([]);
  return cacheService.getState(request);
}
