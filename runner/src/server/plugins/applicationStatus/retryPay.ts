import { HapiRequest, HapiResponseToolkit } from "server/types";
import { FormModel } from "server/plugins/engine/models";

export async function retryPay(request: HapiRequest, h: HapiResponseToolkit) {
  const { statusService } = request.services([]);
  const shouldShowPayErrorPage = await statusService.shouldShowPayErrorPage(
    request
  );

  const form: FormModel = request.server.app.forms[request.params.id];
  const feeOptions = form.feeOptions;
  const {
    allowSubmissionWithoutPayment = true,
    customPayErrorMessage,
  } = feeOptions;
  if (shouldShowPayErrorPage) {
    return h
      .view("pay-error", {
        errorList: ["there was a problem with your payment"],
        allowSubmissionWithoutPayment,
        customPayErrorMessage,
      })
      .takeover();
  }

  return shouldShowPayErrorPage;
}
