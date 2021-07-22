import { redirectTo } from "./engine";
import { HapiRequest, HapiResponseToolkit } from "../types";

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
          pre: [
            {
              method: (request) => {
                const { statusService } = request.services([]);
                return statusService.shouldRetryPay(request);
              },
              assign: "shouldRetryPay",
            },
            {
              method: (request) => {
                const { cacheService } = request.services([]);
                return cacheService.getConfirmationState(request);
              },
              assign: "confirmationViewModel",
            },
          ],
          handler: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { statusService, cacheService } = request.services([]);
            const { params } = request;
            const form = server.app.forms[params.id];

            if (!!request.pre.confirmationViewModel?.confirmation) {
              return h.view(
                "confirmation",
                request.pre.confirmationViewModel.confirmation
              );
            }

            if (request.pre.shouldRetryPay) {
              return h.view("pay-error", {
                errorList: ["there was a problem with your payment"],
              });
            }

            const state = await cacheService.getState(request);
            const { error } = form
              .makeSchema(state)
              .validate(state, { stripUnknown: true });

            if (error) {
              return h.redirect(`/${params.id}${form.def.startPage}`);
            }

            const {
              reference: newReference,
            } = await statusService.outputRequests(request);

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
          const url = new URL(
            `${request.headers.origin}/${request.params.id}/status`
          ).toString();
          const res = await payService.payRequest(
            meta.amount,
            meta.description,
            meta.payApiKey,
            url
          );
          await cacheService.mergeState(request, {
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

export default applicationStatus;
