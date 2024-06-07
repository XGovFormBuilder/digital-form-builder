import { SummaryPageController } from "./SummaryPageController";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { redirectTo } from "server/plugins/engine";
import config from "server/config";

export class ConfirmPageController extends SummaryPageController {
  // Controller to add confirm and continue button
  summary: ConfirmPageController;
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);

      const state = await cacheService.getState(request);
      const fund_name = state["metadata"]["fund_name"];
      const round_name = state["metadata"]["round_name"];
      return redirectTo(
        request,
        h,
        config.eligibilityResultUrl + "/" + fund_name + "/" + round_name
      );
    };
  }
}
