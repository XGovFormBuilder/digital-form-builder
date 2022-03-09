import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import * as path from "path";

import { StatusService } from "server/services";
import { FormModel } from "src/server/plugins/engine/models";
import createServer from "src/server";
import cheerio from "cheerio";
const form = require("./../status.test.json");

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test, describe, before, after } = lab;

const cacheService = { getState: () => ({}), mergeState: () => {} },
  webhookService = { postRequest: () => ({}) },
  notifyService = { sendNotification: () => ({}) },
  payService = {
    payStatus: () => {},
  };

const yar = {
  id: "session_id",
};

const server = {
  services: () => ({
    cacheService,
    webhookService,
    payService,
    notifyService,
  }),
  logger: {
    info: () => {},
    trace: () => {},
  },
};
suite("Server StatusService", () => {
  describe("shouldRetryPay", () => {
    afterEach(() => {
      sinon.restore();
    });
    test("returns false when no pay information is saved in the session", async () => {
      const statusService = new StatusService(server);
      expect(await statusService.shouldRetryPay({ yar })).to.equal(false);
    });

    test("returns false when the continue query parameter is true", async () => {
      sinon.stub(cacheService, "getState").returns({ state: { pay: {} } });
      const statusService = new StatusService(server);
      expect(
        await statusService.shouldRetryPay({ yar, query: { continue: "true" } })
      ).to.equal(false);
    });

    test("returns false when 3 pay attempts have been made", async () => {
      sinon
        .stub(cacheService, "getState")
        .returns({ state: { pay: { meta: 3 } } });
      const statusService = new StatusService(server);

      expect(await statusService.shouldRetryPay({ yar })).to.equal(false);
    });

    test("returns true when <3 pay attempts have been made", async () => {
      sinon
        .stub(cacheService, "getState")
        .returns({ pay: { meta: { attempts: 1 } } });

      sinon.stub(payService, "payStatus").returns({
        state: {
          status: "failed",
        },
      });

      const statusService = new StatusService(server);
      expect(await statusService.shouldRetryPay({ yar })).to.equal(true);
    });

    test("returns true when <3 and the continue query is true", async () => {
      sinon
        .stub(cacheService, "getState")
        .returns({ pay: { meta: { attempts: 1 } } });

      sinon.stub(payService, "payStatus").returns({
        state: {
          status: "failed",
        },
      });

      const statusService = new StatusService(server);
      expect(
        await statusService.shouldRetryPay({ yar, query: { continue: "true" } })
      ).to.equal(false);
    });
  });

  describe("outputRequests", () => {
    afterEach(() => {
      sinon.restore();
    });
    const notifyOutput = {
      outputData: {
        type: "notify",

        apiKey: "a",
        templateId: "b",
        emailAddress: "c",
        personalisation: {},
        addReferencesToPersonalisation: false,
      },
    };
    const firstWebhook = {
      type: "webhook",
      outputData: { url: "abc" },
    };
    const webhookOutput = {
      type: "webhook",
      outputData: { url: "" },
    };
    const outputs = [firstWebhook, webhookOutput, webhookOutput, notifyOutput];
    const state = {
      webhookData: { metadata: {} },
      outputs,
      pay: { meta: { attempts: 1 } },
    };

    test("makes and returns correct output requests", async () => {
      sinon.stub(cacheService, "getState").returns(state);
      const stub = sinon.stub(webhookService, "postRequest");
      stub
        .onCall(0)
        .resolves("abcd-ef-g")
        .onCall(1)
        .rejects()
        .onCall(2)
        .resolves("3");

      const statusService = new StatusService(server);
      const res = await statusService.outputRequests({ yar });

      const results = await res.results;
      expect(res.reference).to.equal("abcd-ef-g");
      expect(results.length).to.equal(outputs.length - 1);
      expect(results.map((result) => result.status)).to.equal([
        "fulfilled",
        "rejected",
        "fulfilled",
      ]);
      expect(results[2].value).to.equal("3");
    });
  });

  describe("getViewModel", () => {
    test("returns the correct components based on a condition", () => {
      const stateForLisbon = {
        whichConsulate: "lisbon",
      };

      const formModel = new FormModel(form, {});
      const statusService = new StatusService(server);

      const lisbonViewModel = statusService.getViewModel(
        stateForLisbon,
        formModel
      );

      expect(lisbonViewModel.components.length).to.equal(1);
      expect(lisbonViewModel.components[0].model).to.equal({
        attributes: {},
        content: "lisbon",
        condition: "isLisbon",
      });
      const stateForPortimao = {
        whichConsulate: "portimao",
      };

      const portimaoViewModel = statusService.getViewModel(
        stateForPortimao,
        formModel
      );
      expect(portimaoViewModel.components[0].model).to.equal({
        attributes: {},
        content: "portimao",
        condition: "isPortimao",
      });
    });
  });

  describe("renders custom text correctly", () => {
    let server;
    let statusService;
    let response;
    let $;

    before(async () => {
      server = await createServer({
        formFileName: "status.test.json",
        formFilePath: path.join(__dirname, ".."),
        enforceCsrf: false,
      });
      statusService = server.services().statusService;
    });

    after(async () => {
      await server.stop();
    });

    test("with no customText defined", async () => {
      let formModel = new FormModel(form, {});
      formModel.def.specialPages = {};

      let vmWithoutConfirmationPage = statusService.getViewModel({}, formModel);
      response = await server.render("confirmation", vmWithoutConfirmationPage);

      $ = cheerio.load(response);
      expect($("h1").text()).to.contain("Application complete");
      expect($("body").text()).to.contain("What happens next");
      expect($("body").text()).to.contain(
        "You will receive an email with details with the next steps"
      );

      formModel.def.specialPages = {
        confirmationPage: {},
      };

      const vmWithoutCustomText = statusService.getViewModel({}, formModel);
      response = await server.render("confirmation", vmWithoutCustomText);

      $ = cheerio.load(response);
      expect($("h1").text()).to.contain("Application complete");
      expect($("body").text()).to.contain(
        "You will receive an email with details with the next steps"
      );
    });

    test("with customText defined", async () => {
      let formModel = new FormModel(form, {});

      formModel.def.specialPages.confirmationPage.customText = {
        nextSteps: false,
        paymentSkipped: false,
      };

      const vmWithToggledText = statusService.getViewModel({}, formModel);
      response = await server.render("confirmation", {
        ...vmWithToggledText,
        paymentSkipped: true,
      });

      $ = cheerio.load(response);
      expect($("body").text()).to.not.contain(
        "Someone will be in touch to make a payment."
      );
      expect($("body").text()).to.not.contain(
        "You will receive an email with details with the next steps"
      );

      formModel.def.specialPages.confirmationPage.customText = {
        title: "Soup",
        nextSteps: "Tragedy",
        paymentSkipped: "No eggs for you",
      };

      const vmWithCustomisations = statusService.getViewModel({}, formModel);
      response = await server.render("confirmation", {
        ...vmWithCustomisations,
        paymentSkipped: true,
      });

      $ = cheerio.load(response);
      expect($("h1").text()).to.contain("Soup");
      expect($("body").text()).to.contain("No eggs for you");
      expect($("body").text()).to.not.contain(
        "You will receive an email with details with the next steps"
      );

      response = await server.render("confirmation", vmWithCustomisations);

      $ = cheerio.load(response);
      expect($("h1").text()).to.contain("Soup");
      expect($("body").text()).to.not.contain("No eggs for you");
      expect($("body").text()).to.contain("Tragedy");
    });
  });
});
