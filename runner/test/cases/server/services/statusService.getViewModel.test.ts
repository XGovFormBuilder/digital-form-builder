import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import * as path from "path";

import { StatusService } from "server/services";
import { FormModel } from "src/server/plugins/engine/models";
import createServer from "src/server";
import cheerio from "cheerio";
const form = require("./../status.test.json");

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, describe, before, after } = lab;

const cacheService = { getState: () => ({}), mergeState: () => {} },
  webhookService = { postRequest: () => ({}) },
  notifyService = { sendNotification: () => ({}) },
  payService = {
    payStatus: () => {},
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

describe("returns the correct components based on a condition", () => {
  const stateForLisbon = {
    whichConsulate: "lisbon",
  };

  const formModel = new FormModel(form, {});
  const statusService = new StatusService(server);

  const lisbonViewModel = statusService.getViewModel(stateForLisbon, formModel);

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

describe("StatusService getViewModel returns the correct components based on a condition", () => {
  const stateForLisbon = {
    whichConsulate: "lisbon",
  };

  const formModel = new FormModel(form, {});
  const statusService = new StatusService(server);

  const lisbonViewModel = statusService.getViewModel(stateForLisbon, formModel);

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

suite("StatusService getViewModel renders custom text correctly", () => {
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

  test("with confirmationPage undefined", async () => {
    const formDef = { ...form, specialPages: {} };
    let formModel = new FormModel(formDef, {});
    let vmWithoutConfirmationPage = statusService.getViewModel({}, formModel);
    response = await server.render("confirmation", vmWithoutConfirmationPage);

    $ = cheerio.load(response);
    expect($("body").text()).to.contain("Application complete");
    expect($("body").text()).to.contain(
      "You will receive an email with details with the next steps"
    );
  });
  test("with confirmationPage as empty object", async () => {
    const formDef = { ...form, specialPages: { confirmationPage: {} } };
    let formModel = new FormModel(formDef, {});

    const vmWithoutCustomText = statusService.getViewModel({}, formModel);
    response = await server.render("confirmation", vmWithoutCustomText);

    $ = cheerio.load(response);
    expect($("body").text()).to.contain("Application complete");
    expect($("body").text()).to.contain(
      "You will receive an email with details with the next steps"
    );
  });

  test("with customText toggled", async () => {
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

    test("with callback override", async () => {});
  });
  test("with customText defined", async () => {
    let formModel = new FormModel(form, {});

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

    response = await server.render("confirmation", {
      ...vmWithCustomisations,
      paymentSkipped: false,
    });

    $ = cheerio.load(response);
    expect($("h1").text()).to.contain("Soup");
    expect($("body").text()).to.not.contain("No eggs for you");
    expect($("body").text()).to.contain("Tragedy");
  });

  //TODO - turning on allowUserTemplates breaks CSRF tests
  test.skip("customText defined with nunjucks templates are not overwritten with a static value", async () => {
    // previously, the first render would overwrite formModel.def.specialPages.confirmationPage values with the first rendered value
    // and would render the same value for all subsequent values, as if it was a static value.

    let formModel = new FormModel(form, {});

    const renderOne = statusService.getViewModel(
      {
        whichConsulate: "this is render one",
      },
      formModel
    );
    response = await server.render("confirmation", {
      ...renderOne,
      paymentSkipped: true,
    });

    $ = cheerio.load(response);
    expect($("body").text()).to.contain("this is render one");

    const renderTwo = statusService.getViewModel(
      {
        whichConsulate: "this is render two",
      },
      formModel
    );

    response = await server.render("confirmation", {
      ...renderTwo,
      paymentSkipped: false,
    });

    $ = cheerio.load(response);
    expect($("body").text()).to.contain("this is render two");
  });

  test("with callback defined", async () => {
    let formModel = new FormModel(form, {});

    formModel.def.specialPages.confirmationPage.customText = {
      title: "Soup",
      nextSteps: "Tragedy",
      paymentSkipped: "No eggs for you",
    };

    const userState = {
      callback: {
        customText: {
          title: "Application resubmitted",
          paymentSkipped: false,
          nextSteps: false,
        },
        components: [
          {
            options: {},
            type: "Html",
            content: "Thanks!",
            schema: {},
          },
        ],
      },
    };

    const vmWithCallback = statusService.getViewModel(userState, formModel);
    response = await server.render("confirmation", {
      ...vmWithCallback,
      paymentSkipped: true,
    });

    $ = cheerio.load(response);
    expect($("h1").text()).to.contain("Application resubmitted");
    expect($("body").text()).to.contain("Thanks!");
    expect($("body").text()).to.not.contain("No eggs for you");
    expect($("body").text()).to.not.contain(
      "You will receive an email with details with the next steps"
    );
  });
});
