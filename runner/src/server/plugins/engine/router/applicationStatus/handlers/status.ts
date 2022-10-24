import { HapiLifecycleMethod } from "server/types";
import { redirectTo } from "server/plugins/engine";

export const preGet = {
  shouldRetryPay: {
    method: (request) => {
      const { statusService } = request.services([]);
      return statusService.shouldRetryPay(request);
    },
    assign: "shouldRetryPay",
  },
  confirmationViewModel: {
    method: (request) => {
      const { cacheService } = request.services([]);
      return cacheService.getConfirmationState(request);
    },
    assign: "confirmationViewModel",
  },
};

export const get: HapiLifecycleMethod = async (request, h) => {
  const { statusService, cacheService } = request.services([]);
  const { params } = request;
  const form = request.server.app.forms[params.id];

  if (!!request.pre.confirmationViewModel?.confirmation) {
    request.logger.info(
      [`/${params.id}/status`],
      `${request.yar.id} confirmationViewModel found for user`
    );
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

  /**
   * TODO: investigate why this keeps spewing up
   */
  if (state?.userCompletedSummary !== true) {
    request.logger.error(
      [`/${params.id}/status`],
      `${request.yar.id} user has incomplete state`
    );
    return h.redirect(`/${params.id}/summary`);
  }

  const { reference: newReference } = await statusService.outputRequests(
    request
  );

  const viewModel = statusService.getViewModel(state, form, newReference);

  await cacheService.setConfirmationState(request, {
    confirmation: viewModel,
  });
  await cacheService.clearState(request);

  return h.view("confirmation", viewModel);
};

export const post: HapiLifecycleMethod = async (request, h) => {
  const { payService, cacheService } = request.services([]);
  const { pay } = await cacheService.getState(request);
  const { meta } = pay;
  meta.attempts++;
  request.logger.info(
    [request.yar.id, "payment attempt"],
    `user is on payment attempt ${meta.attempts}`
  );

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
};
