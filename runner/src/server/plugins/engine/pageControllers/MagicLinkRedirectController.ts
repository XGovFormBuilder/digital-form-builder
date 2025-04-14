import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export class MagicLinkRedirectController extends PageController {
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      return h.redirect("/magic-link/start").code(302);
    };
  }
}
