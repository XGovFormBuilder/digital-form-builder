import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { FormModel } from "../../../../../src/server/plugins/engine/models";
import config from "../../../../../src/server/config";
import form from "./SummaryViewModel.json";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

suite("SummaryPageController", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("returns the correct apiKey", async () => {
    sinon.stub(config, "apiEnv").value("test");

    const formModel = new FormModel(form, {});
    const summaryPage = formModel.pages.find(
      (page) => page.path === "/summary"
    );

    expect(summaryPage.payApiKey).to.equal("test_api_key");
    sinon.stub(config, "apiEnv").value("production");
    expect(summaryPage.payApiKey).to.equal("production_api_key");
  });
});
