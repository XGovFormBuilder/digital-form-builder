import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import * as redirectsMap from "server/templates/redirects.json";

export class RedirectPageController extends PageController {
  redirectMap: Record<string, string>;
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    this.redirectMap = redirectsMap;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { url } = request;
      const pathWithQuery = `${url.pathname}${url.search}`;
      if (this.redirectMap[pathWithQuery]) {
        return h.redirect(this.redirectMap[pathWithQuery]);
      }

      return super.makeGetRouteHandler()(request, h);
    };
  }
}
