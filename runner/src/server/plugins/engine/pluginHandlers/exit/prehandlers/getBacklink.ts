import { HapiRequest, HapiResponseToolkit } from "server/types";

/**
 * This must be used **after** `getState`. Retrieves the user's last known page
 * for this form.
 */
export async function getBacklink(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const state = request.pre.state;
  const { progress } = state;
  return progress?.at?.(-1) ?? null;
}
