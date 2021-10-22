import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import {
  FormModel,
  SummaryViewModel,
} from "../../../../../src/server/plugins/engine/models";
import config from "../../../../../src/server/config";
import form from "./SummaryViewModel.json";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

suite("SummaryViewModel", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("returns the correct apiKey", async () => {
    sinon.stub(config, "apiEnv").value("test");

    const formModel = new FormModel(form, {});
    const viewModel = new SummaryViewModel(
      "summary",
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
    expect(viewModel.payApiKey).to.equal("test_api_key");
    sinon.stub(config, "apiEnv").value("production");
    expect(viewModel.payApiKey).to.equal("production_api_key");
  });
});
