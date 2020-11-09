import Page from "./page";
import { HapiRequest, HapiResponseToolkit } from "../../../types";

export default class HomePage extends Page {
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
            // Method must return a value, a promise, or throw an error
            return h.continue;
          },
        },
      },
    };
  }
}

// Keep module.exports until https://github.com/XGovFormBuilder/digital-form-builder/issues/162
module.exports = HomePage;
