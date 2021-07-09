import { nanoid } from "nanoid";
import { decodeFeedbackContextInfo, redirectTo } from "./engine";
import { HapiRequest, HapiResponseToolkit } from "../types";
import { feedbackReturnInfoKey } from "server/plugins/engine/helpers";

function getFeedbackContextInfo(request: HapiRequest) {
  if (request.query[feedbackReturnInfoKey]) {
    return decodeFeedbackContextInfo(
      request.url.searchParams.get(feedbackReturnInfoKey)
    );
  }
}

function successfulOutcome(
  request: HapiRequest,
  h: HapiResponseToolkit,
  model?: any
) {
  const feedbackContextInfo = getFeedbackContextInfo(request);

  if (feedbackContextInfo) {
    return h.redirect(feedbackContextInfo.url);
  }

  return h.view("confirmation", model);
}

function retryPay(request, h) {
  const { cacheService, statusService } = request.services([]);
  const { pay, reference } = await cacheService.getState(request);

  if (await statusService.shouldRetryPay(request, pay)) {
    return h.view("pay-error", {
      reference,
      errorList: ["there was a problem with your payment"],
    });
  }
}

const applicationStatus = {
  plugin: {
    name: "applicationStatus",
    dependencies: "vision",
    multiple: true,
    register: (server) => {
      server.route({
        method: "get",
        path: "/{id}/status",
        options: {
          pre: [{ method: retryPay }],
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { cacheService, statusService } = request.services([]);

            const { pay, reference } = await cacheService.getState(request);
            let model = {
              reference: reference === "UNKNOWN" ? undefined : reference,
              ...(pay && { paymentSkipped: pay.paymentSkipped }),
            };

            if (reference) {
              return successfulOutcome(request, h, model);
            }

            const { newReference } = await statusService.outputRequests(
              request
            );

            return successfulOutcome(request, h, {
              reference: newReference === "UNKNOWN" ? undefined : newReference,
              ...(pay && { paymentSkipped: pay.paymentSkipped }),
            });
          },
        },
      });
      server.route({
        method: "post",
        path: "/{id}/status",
        handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
          const { payService, cacheService } = request.services([]);
          const { pay } = await cacheService.getState(request);
          const { meta } = pay;
          meta.attempts++;
          // TODO:- let payService handle nanoid(10)
          const reference = `${nanoid(10)}`;
          const url = new URL(
            `${request.headers.origin}/${request.params.id}/status`
          ).toString();
          const res = await payService.payRequest(
            meta.amount,
            reference,
            meta.description,
            meta.payApiKey,
            url
          );
          await cacheService.mergeState(request, {
            pay: {
              payId: res.payment_id,
              reference,
              self: res._links.self.href,
              meta,
            },
          });
          return redirectTo(request, h, res._links.next_url.href);
        },
      });
    },
  },
};

export default applicationStatus;
