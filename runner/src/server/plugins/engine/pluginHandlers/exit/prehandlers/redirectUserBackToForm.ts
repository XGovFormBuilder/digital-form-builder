import { HapiRequest, HapiResponseToolkit } from "server/types";

/**
 * Attempts to redirect the user back to the start page of the form if ExitState is empty
 * This prehandler must be used **after** {@link `getFormPrehandler`} and {@link `getState`}
 */
export function redirectUserBackToForm(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
  const form = request.pre.form;
  const state = request.pre.state;
  if (!state?.exitState) {
    return h.redirect(`/${form.basePath}${form.startPage.path}`).takeover();
  }
  return h.continue;
}
