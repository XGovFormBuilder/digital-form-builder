import Page from "./page";

export default class HomePage extends Page {
  constructor(defs, pageDef) {
    super(defs, pageDef);
    this.x = "";
  }

  get getRouteOptions() {
    return {
      // handler: (request, h) => {
      //   return { ok: 200 }
      // },
      ext: {
        onPostHandler: {
          method: (request, h) => {
            console.log("onPostHandler Home");

            // Method must return a value, a promise, or throw an error
            return h.continue;
          },
        },
      },
    };
  }

  get postRouteOptions() {
    return {
      // handler: (request, h) => {
      //   return { ok: 200 }
      // },
      ext: {
        onPostHandler: {
          method: (request, h) => {
            console.log("onPostHandler Home");

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
