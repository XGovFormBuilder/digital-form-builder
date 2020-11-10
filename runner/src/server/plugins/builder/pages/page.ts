import { Page as PageBase } from "../../../engine";
import { HapiRequest, HapiResponseToolkit } from "../../../types";

export default class Page extends PageBase {
  // TODO: improve type, see Page once types mature
  constructor(model: any, pageDef: any) {
    super(model, pageDef);
  }

  get getRouteOptions(): {
    ext: any;
  } {
    return {
      ext: {
        onPostHandler: {
          method: (_request: HapiRequest, h: HapiResponseToolkit) => {
            console.log(`GET onPostHandler ${this.path}`);
            return h.continue;
          },
        },
      },
    };
  }

  get postRouteOptions(): {
    payload?: any;
    ext: any;
  } {
    return {
      payload: {
        output: "stream",
        parse: true,
        maxBytes: Number.MAX_SAFE_INTEGER,
        failAction: "ignore",
      },
      ext: {
        onPreHandler: {
          method: async (request: HapiRequest, h: HapiResponseToolkit) => {
            const { uploadService } = request.services([]);
            return uploadService.handleUploadRequest(request, h);
          },
        },
        onPostHandler: {
          method: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }
}

// Keep module.exports until https://github.com/XGovFormBuilder/digital-form-builder/issues/162
module.exports = Page;
