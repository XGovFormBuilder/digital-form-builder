import { HapiRequest, HapiResponseToolkit } from "server/types";

export async function retryPay(request: HapiRequest, h: HapiResponseToolkit) {
  const { statusService } = request.services([]);
  const shouldRetryPay = await statusService.shouldRetryPay(request);
  if (shouldRetryPay) {
    return h
      .view("pay-error", {
        errorList: ["there was a problem with your payment"],
      })
      .takeover();
  }

  return shouldRetryPay;
}
