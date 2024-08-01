import { HapiRequest, HapiResponseToolkit } from "server/types";
import { errorListFromValidationResult } from "./utils";

/**
 * Parses Joi errors that have been stored on `exitEmailError`
 */
export function parseExitEmailErrors(
  request: HapiRequest,
  _h: HapiResponseToolkit
) {
  const errors = request.yar.flash("exitEmailError");
  return errorListFromValidationResult(errors);
}
