import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import {
  controllerNameFromPath,
  getPageController,
} from "server/plugins/engine/pageControllers/helpers";

import * as PageControllers from "server/plugins/engine/pageControllers";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { describe, suite, test } = lab;

suite("Engine Page Controllers getPageController", () => {
  describe("controllerNameFromPath", () => {
    test("controller name is extracted correctly", () => {
      const filePath = "./pages/summary.js";
      const controllerName = controllerNameFromPath(filePath);
      expect(controllerName).to.equal("SummaryPageController");
    });

    test("kebab-case is pascal-case", () => {
      const filePath = "./pages/dob.js";
      const controllerName = controllerNameFromPath(filePath);
      expect(controllerName).to.equal("DobPageController");
    });
  });

  describe("getPageController", () => {
    test("it returns DobPageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/dob.js");
      expect(controllerFromPath).to.equal(PageControllers.DobPageController);

      const controllerFromName = getPageController("DobPageController");
      expect(controllerFromName).to.equal(PageControllers.DobPageController);
    });

    test("it returns HomePageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/home.js");
      expect(controllerFromPath).to.equal(PageControllers.HomePageController);

      const controllerFromName = getPageController("HomePageController");
      expect(controllerFromName).to.equal(PageControllers.HomePageController);
    });

    test("it returns StartDatePageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/start-date.js");
      expect(controllerFromPath).to.equal(
        PageControllers.StartDatePageController
      );

      const controllerFromName = getPageController("StartDatePageController");
      expect(controllerFromName).to.equal(
        PageControllers.StartDatePageController
      );
    });

    test("it returns StartPageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/start.js");
      expect(controllerFromPath).to.equal(PageControllers.StartPageController);

      const controllerFromName = getPageController("StartPageController");
      expect(controllerFromName).to.equal(PageControllers.StartPageController);
    });

    test("it returns SummaryPageController when a legacy path is passed", () => {
      const controllerFromPath = getPageController("./pages/summary.js");
      expect(controllerFromPath).to.equal(
        PageControllers.SummaryPageController
      );

      const controllerFromName = getPageController("SummaryPageController");
      expect(controllerFromName).to.equal(
        PageControllers.SummaryPageController
      );
    });
  });
});
