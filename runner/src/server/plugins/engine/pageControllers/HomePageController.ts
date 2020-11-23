import { PageController } from "./PageController";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export class HomePageController extends PageController {
  get getRouteOptions() {
    return {
      ext: {
        onPostHandler: {
          method: (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }

  get postRouteOptions() {
    return {
      ext: {
        onPostHandler: {
          method: (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }
}
