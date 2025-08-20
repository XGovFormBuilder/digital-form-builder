import { HapiRequest, HapiResponseToolkit } from "server/types";
import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";

/**
 * MiniSummaryPageController is for mini summary pages
 */
export class MiniSummaryPageController extends PageController {
  isMiniSummaryPageController = true;

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const state = await cacheService.getState(request);
      const { title, model } = this;

      const summary = new SummaryViewModel(title, model, state, request);
      const sectionDetails = this.pageDef.section
        ? summary.details.find((detail) => detail.name === this.pageDef.section)
        : summary.details[0];

      const items = sectionDetails.items.map((item) => {
        return { ...item, url: `item.pageId?returnUrl=${this.path}` };
      });
      this.details = [{ items }];

      return super.makeGetRouteHandler()(request, h);
    };
  }

  get viewName() {
    return "mini-summary";
  }
}
