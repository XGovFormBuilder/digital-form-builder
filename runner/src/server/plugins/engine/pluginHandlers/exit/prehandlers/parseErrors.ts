import { HapiRequest, HapiResponseToolkit } from "server/types";
import { errorListFromValidationResult } from "./utils";

export function parseErrors(request: HapiRequest, _h: HapiResponseToolkit) {
  const errors = request.yar.flash("exitEmailError");
  return errorListFromValidationResult(errors);
}
