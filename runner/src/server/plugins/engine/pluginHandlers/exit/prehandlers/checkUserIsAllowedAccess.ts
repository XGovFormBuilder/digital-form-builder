import { HapiRequest, HapiResponseToolkit } from "server/types";
import Boom from "boom";

/**
 * Attempts to redirect the user back to the start page of the form if ExitState is empty
 * This prehandler must be used **after** {@link `getForm`} and {@link `getState`}
 */
export function checkUserIsAllowedAccess(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
  const form = request.pre.form;
  const state = request.pre.state;
  const userId = request.yar.id;
  if (!form.allowExit) {
    request.logger.error(
      {},
      `user ${userId} attempted to exit but it is not enabled for form ${form.name}`
    );
    throw Boom.forbidden();
  }
  if (!state?.exitState) {
    const lastPage =
      state.progress?.at(-1) ?? `/${form.basePath}${form.startPage.path}`;

    request.logger.error(
      {},
      `User ${userId} attempted to access form without exit state, redirecting them back to ${lastPage}`
    );

    return h.redirect(lastPage).takeover();
  }
  return h.continue;
}
