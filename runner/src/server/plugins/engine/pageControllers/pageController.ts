import { PageControllerBase } from "./pageControllerBase";
import { HapiRequest, HapiResponseToolkit } from "../../../types";

export class PageController extends PageControllerBase {
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
