import PageBase from "./page-base";

export default class Page extends PageBase {
  get getRouteOptions() {
    return {
      ext: {
        onPostHandler: {
          method: (request, h) => {
            console.log(`GET onPostHandler ${this.path}`);
            return h.continue;
          },
        },
      },
    };
  }

  get postRouteOptions() {
    return {
      payload: {
        output: "stream",
        parse: true,
        maxBytes: Number.MAX_SAFE_INTEGER,
        failAction: "ignore",
      },
      ext: {
        onPreHandler: {
          method: async (request, h) => {
            const { uploadService } = request.services([]);
            return uploadService.handleUploadRequest(request, h);
          },
        },
        onPostHandler: {
          method: async (request, h) => {
            return h.continue;
          },
        },
      },
    };
  }
}

// Keep module.exports until https://github.com/XGovFormBuilder/digital-form-builder/issues/162
module.exports = Page;
