import { PageController } from "./PageController";
import { redirectTo } from "../helpers";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export class MagicLinkStartPageController extends PageController {
  constructor(model, pageDef) {
    super(model, pageDef);
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      if (this.model.values.toggle === false) {
        return redirectTo(request, h, this.model.values.toggleRedirect);
      }
      return this.makePostRouteHandler()(request, h);
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      // Redirect to custom page instead of status
      return redirectTo(request, h, `/${request.params.id}/email`);
    };
  }
}
