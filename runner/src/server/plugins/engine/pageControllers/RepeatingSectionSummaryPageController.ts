import { HapiRequest, HapiResponseToolkit } from "server/types";
import { SummaryViewModel } from "../models";
import { PageController } from "./PageController";

/**
 * RepeatingSectionSummaryPageController is for pages summarising a set of sections
 */
export class RepeatingSectionSummaryPageController extends PageController {
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { remove } = request.query;
      const { cacheService } = request.services([]);
      const state = await cacheService.getState(request);
      const noInt = (str: string) => str.replace(/\d+/g, "");
      const int = (str: string) => parseInt(str.replace(/^\D+/g, ""));

      const { title, model } = this;
      const summary = new SummaryViewModel(title, model, state, request);
      const summaryFiltered = summary.details.filter(
        (detail) =>
          detail.title &&
          detail.title.match(new RegExp(`${title} \\d`)) &&
          detail.items[0].value
      );

      if (remove && state[remove]) {
        const newState = {};
        Object.entries(state).forEach(([key, value]) => {
          if (key.includes(noInt(remove))) {
            const nextSection = state[noInt(key) + (int(key) + 1)];
            if (int(key) < int(remove)) newState[key] = value;
            else if (nextSection) newState[key] = nextSection;
            else newState[key] = null;
          }
        });
        await cacheService.mergeState(request, newState);

        if (int(this.path) === summaryFiltered.length) {
          return h.redirect(
            `/${this.model.basePath}${noInt(this.path)}${int(this.path) - 1}`
          );
        }
        return h.redirect(`/${this.model.basePath}${this.path}`);
      }

      this.details = summaryFiltered.map((detail) => {
        const currentPath = this.path.replace("/", "");
        return {
          ...detail,
          card: detail.items[0].url.replace("summary", currentPath),
        };
      });
      return super.makeGetRouteHandler()(request, h);
    };
  }

  get viewName() {
    return "repeating-section-summary";
  }
}
