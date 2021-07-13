import { PageController } from "./PageController";
import { redirectTo } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export class ConfirmationPageController {
  /**
   *
   */
  constructor(model) {}

  /**
   * The controller which is used when Page["controller"] is defined as "./pages/ConfirmationPageController"
   */
  async getRouteHandler(request: HapiRequest, h: HapiResponseToolkit) {
    const { cacheService, statusService } = request.services([]);
    const { pay, reference } = await cacheService.getState(request);
    const model = {
      reference: reference === "UNKNOWN" ? undefined : reference,
      ...(pay && { paymentSkipped: pay.paymentSkipped }),
    };

    if (reference) {
      return h.view("confirmation", model);
    }

    const { reference: newReference } = await statusService.outputRequests(
      request
    );

    return h.view("confirmation", {
      ...model,
      reference: newReference === "UNKNOWN" ? model.reference : newReference,
    });
  }

  async postRouteHandler(request: HapiRequest, h: HapiResponseToolkit) {
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
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/status`,
   */
  makeGetRouteHandler() {
    return this.getRouteHandler;
  }
  get getRouteOptions(): {
    ext: any;
  } {
    return {
      ext: {
        onPreHandler: {
          method: retryPay,
          assign: "shouldRetryPay",
        },
      },
    };
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {
    return this.postRouteHandler;
  }
}
async function retryPay(request, h) {
  const { cacheService, statusService } = request.services([]);
  const { pay } = await cacheService.getState(request);
  const c = statusService.shouldRetryPay(request, pay);
  return c;
}
