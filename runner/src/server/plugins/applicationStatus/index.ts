import { redirectTo } from "./../engine";
import { HapiRequest, HapiResponseToolkit } from "../../types";
import { retryPay } from "./retryPay";
import { handleUserWithConfirmationViewModel } from "./handleUserWithConfirmationViewModel";
import { checkUserCompletedSummary } from "./checkUserCompletedSummary";
import config from "server/config";

const index = {
  plugin: {
    name: "applicationStatus",
    dependencies: "@hapi/vision",
    multiple: true,
    register: (server) => {
      server.route({
        method: "get",
        path: "/{id}/status",
        options: {
          pre: [
            {
              method: retryPay,
              assign: "shouldRetryPay",
            },
            {
              method: handleUserWithConfirmationViewModel,
              assign: "confirmationViewModel",
            },
            {
              method: checkUserCompletedSummary,
              assign: "userCompletedSummary",
            },
          ],
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { statusService, cacheService } = request.services([]);

            const { params } = request;
            const form = server.app.forms[params.id];

            const state = await cacheService.getState(request);

            const {
              reference: newReference,
            } = await statusService.outputRequests(request);

            if (state.callback?.skipSummary?.redirectUrl) {
              const { redirectUrl } = state.callback?.skipSummary;
              request.logger.info(
                ["applicationStatus"],
                `Callback skipSummary detected, redirecting ${request.yar.id} to ${redirectUrl} and clearing state`
              );
              await cacheService.setConfirmationState(request, {
                redirectUrl,
              });
              await cacheService.clearState(request);

              return h.redirect(redirectUrl);
            }

            const viewModel = statusService.getViewModel(
              state,
              form,
              newReference
            );

            await cacheService.setConfirmationState(request, {
              confirmation: viewModel,
            });
            await cacheService.clearState(request);

            return h.view("confirmation", viewModel);
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
          const res = await payService.retryPayRequest(pay);

          await cacheService.mergeState(request, {
            webhookData: {
              fees: {
                paymentReference: res.reference,
              },
            },
            pay: {
              payId: res.payment_id,
              reference: res.reference,
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

export default index;
