import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import * as path from "path";

import { FormModel } from "src/server/plugins/engine/models";
import createServer from "src/server";
import cheerio from "cheerio";
import { MultiStartPageController } from "../../../../../../src/server/plugins/engine/pageControllers/MultiStartPageController";
const form = require("../../../multi-start-page.test.json");

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, before, after } = lab;

suite(
  "MultiStartPageController getViewModel renders buttons and pagination correctly",
  () => {
    let server;
    let response;
    let $;

    before(async () => {
      server = await createServer({
        formFileName: "multi-start-page.test.json",
        formFilePath: path.join(__dirname, "../../../"),
        enforceCsrf: false,
      });
      server.route({
        method: "GET",
        path: "/first-page",
        handler: () => {
          return {};
        },
        options: {},
      });
    });
    after(async () => {
      await server.stop();
    });

    test("with showContinueButton set to false", async () => {
      const pages = [...form.pages];
      const firstPage = pages.shift();
      firstPage.showContinueButton = false;
      const formDef = { ...form, pages: [firstPage, ...pages] };
      let formModel = new FormModel(formDef, {});
      const pageController = new MultiStartPageController(formModel, firstPage);
      const vmWithoutContinueButton = pageController.getViewModel(
        {},
        formModel
      );
      response = await server.render(
        "multi-start-page",
        vmWithoutContinueButton
      );

      $ = cheerio.load(response);
      expect($(".govuk-main-wrapper button.govuk-button").length).to.equal(0);
    });
    test("with showContinueButton set to true", async () => {
      const pages = [...form.pages];
      const firstPage = pages.shift();
      firstPage.showContinueButton = true;
      const formDef = { ...form, pages: [firstPage, ...pages] };
      let formModel = new FormModel(formDef, {});
      const pageController = new MultiStartPageController(formModel, firstPage);
      const vmWithContinueButton = pageController.getViewModel({}, formModel);
      response = await server.render("multi-start-page", vmWithContinueButton);

      $ = cheerio.load(response);
      expect($(".govuk-main-wrapper .govuk-button")).to.exist();
    });
    test("with showContinueButton set to true and custom continue button text specified", async () => {
      const pages = [...form.pages];
      const firstPage = pages.shift();
      firstPage.showContinueButton = true;
      firstPage.continueButtonText = "Apply now";
      const formDef = { ...form, pages: [firstPage, ...pages] };
      let formModel = new FormModel(formDef, {});
      const pageController = new MultiStartPageController(formModel, firstPage);
      const vmWithCustomButton = pageController.getViewModel({}, formModel);
      response = await server.render("multi-start-page", vmWithCustomButton);

      $ = cheerio.load(response);
      expect($(".govuk-main-wrapper button.govuk-button").text()).to.contain(
        "Apply now"
      );
    });

    test("with only a previous link defined", async () => {
      const pages = [...form.pages];
      const firstPage = pages.shift();
      firstPage.startPageNavigation = {
        previous: {
          labelText: "How to get started",
          href: "/how-to-get-started",
        },
      };
      const formDef = { ...form, pages: [firstPage, ...pages] };
      let formModel = new FormModel(formDef, {});
      const pageController = new MultiStartPageController(formModel, firstPage);
      const vmWithPrevLink = pageController.getViewModel({}, formModel);
      response = await server.render("multi-start-page", vmWithPrevLink);

      $ = cheerio.load(response);
      expect(
        $(".govuk-main-wrapper .govuk-pagination__prev .govuk-link").prop(
          "href"
        )
      ).to.equal("/how-to-get-started");
      expect(
        $(".govuk-main-wrapper .govuk-pagination__prev .govuk-link").text()
      ).to.contain("How to get started");
    });

    test("with only a next link defined", async () => {
      const pages = [...form.pages];
      const firstPage = pages.shift();
      firstPage.startPageNavigation = {
        next: {
          labelText: "How to apply",
          href: "/how-to-apply",
        },
      };
      const formDef = { ...form, pages: [firstPage, ...pages] };
      let formModel = new FormModel(formDef, {});
      const pageController = new MultiStartPageController(formModel, firstPage);
      const vmWithNextLink = pageController.getViewModel({}, formModel);
      response = await server.render("multi-start-page", vmWithNextLink);

      $ = cheerio.load(response);
      expect(
        $(".govuk-main-wrapper .govuk-pagination__next .govuk-link").prop(
          "href"
        )
      ).to.equal("/how-to-apply");
      expect(
        $(".govuk-main-wrapper .govuk-pagination__next .govuk-link").text()
      ).to.contain("How to apply");
    });
  }
);
