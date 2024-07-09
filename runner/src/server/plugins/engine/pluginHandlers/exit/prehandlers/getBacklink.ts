import { HapiRequest, HapiResponseToolkit } from "server/types";

export async function getBacklink(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const state = request.pre.state;
  const { progress } = state;
  return progress?.at?.(-1) ?? null;
}
