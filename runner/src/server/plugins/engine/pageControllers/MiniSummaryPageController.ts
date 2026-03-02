import { HapiRequest, HapiResponseToolkit } from "server/types";
import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";

/**
 * MiniSummaryPageController is for mini summary pages
 */
export class MiniSummaryPageController extends PageController {
  isMiniSummaryPageController = true;
  subtitle?: string;

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const state = await cacheService.getState(request);
      const { title, subtitle, model } = this;

      // TODO: add subtitile to be use in summary view
      const summary = new SummaryViewModel(
        title,
        subtitle,
        model,
        state,
        request
      );
      const sectionDetails = this.pageDef.section
        ? summary.details.find((detail) => detail.name === this.pageDef.section)
        : summary.details[0];

      const items = sectionDetails.items.map((item) => {
        const returnURL = encodeURIComponent(`/${model.basePath}${this.path}`);
        return { ...item, url: `${item.pageId}?returnUrl=${returnURL}` };
      });
      this.details = [{ items }];

      return super.makeGetRouteHandler()(request, h);
    };
  }

  get viewName() {
    return "mini-summary";
  }
}
