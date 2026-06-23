import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "./PageController";

export class RepeatingSectionPageController extends PageController {
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const modifyUpdate = (update) => {
        const sectionName = this.section.name;
        const formDataSection = Object.keys(update[sectionName]).map((key) => {
          return {
            name: key,
            value: update[sectionName][key],
            label: this.components.items.find((item) => item.name === key)!
              .title,
          };
        });
        const newObj = {};
        newObj[sectionName + "Container"] = {
          repeatingSections: [formDataSection],
        };
        return newObj;
      };

      await this.handlePostRequest(request, h, {
        arrayMerge: true,
        modifyUpdate,
      });

      return super.makePostRouteHandler()(request, h);
    };
  }
}
