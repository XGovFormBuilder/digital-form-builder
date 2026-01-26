import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "./PageController";

export class RepeatingSectionPageController extends PageController {
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const modifyUpdate = () => {
        delete request.payload['crumb'];
        const sectionName = this.section.name;
        const newObj = {};
        newObj[sectionName + 'Container'] = [request.payload];
        return newObj;
      };

      await this.handlePostRequest(request, h, {
        arrayMerge: true,
        modifyUpdate,
      });

      return super.makePostRouteHandler()(request, h);
    }
  }
}
