import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import {
  FormModel,
  SaveViewModel,
} from "../../../../../src/server/plugins/engine/models";
import config from "../../../../../src/server/config";
import form from "./SaveViewModel.json";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

suite("SaveViewModel", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("returns the correct webhook questions", async () => {
    sinon.stub(config, "apiEnv").value("test");

    const formModel = new FormModel(form, {});
    const viewModel = new SaveViewModel(
      "save",
      formModel,
      {
        progress: [],
      },
      {
        app: {
          location: "/",
        },
        query: {},
        state: {
          cookie_policy: {},
        },
      }
    );

    const expectedQuestions = [
      {
        category: undefined,
        question: "When will you get married?",
        fields: [[Object], [Object]],
        index: 0,
      },
      {
        category: "aSection",
        question: "Second page",
        fields: [[Object]],
        index: 0,
      },
    ];

    expect(viewModel._webhookData.questions[0].question).to.equal(
      "When will you get married?"
    );
    expect(viewModel._webhookData.questions[1].question).to.equal(
      "How long is your honeymoon?"
    );
  });
});
