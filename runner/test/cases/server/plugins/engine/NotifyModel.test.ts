import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FormModel } from "src/server/plugins/engine/models";
import form from "./NotifyViewModel.json";
import { SummaryViewModel } from "src/server/plugins/engine/models";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

const baseState = {
  progress: ["/test/first-page"],
  aSection: {
    caz: 1,
    name: "Jen",
    emailAddress: "beep.boop@somewh.ere",
  },
};

const request = {
  app: {
    location: "/",
  },
  query: {},
  state: {
    cookie_policy: {},
  },
};

suite("NotifyModel", () => {
  afterEach(() => {
    sinon.restore();
  });
  const formModel = new FormModel(form, {});
  formModel.basePath = "test";
  formModel.name = "My Service";

  test("SummaryViewModel returns a correct NotifyModel", () => {
    const viewModel = new SummaryViewModel(
      "summary",
      formModel,
      baseState,
      request
    );
    const { outputData } = viewModel.outputs[0];

    expect(outputData).to.contain({
      templateId: "some-template-id",
      personalisation: { "aSection.name": "Jen", nameIsJen: true },
      emailAddress: "beep.boop@somewh.ere",
      apiKey: { test: "testKey", production: "productionKey" },
      addReferencesToPersonalisation: true,
      emailReplyToId: "default-email-id",
    });
  });

  test("Returns the correct emailReplyToId", () => {
    const viewModel = new SummaryViewModel(
      "summary",
      formModel,
      { ...baseState, aSection: { ...baseState.aSection, caz: 2 } },
      request
    );
    const { outputData } = viewModel.outputs[0];
    expect(outputData).to.contain({
      emailReplyToId: "bristol-email-id",
    });
  });
});
