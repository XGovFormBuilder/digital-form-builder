import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export class MagicLinkRedirectController extends PageController {
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
    const id = request.params?.id;
    const forms = request.server?.app?.forms;
    const model = id && forms?.[id];
    
    // Fallback to the default Magic Link config used by CareOBRA
    // WARNING: This has hardcoded values 
    // You should define your own magicLinkConfig in your (main) form config   
    const magicLinkConfig = model?.def?.magicLinkConfig ?? 'magic-link';
    
    return h.redirect(`/${magicLinkConfig}/start`).code(302);
    };
  }
}
