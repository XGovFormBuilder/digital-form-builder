import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import wreck from "wreck";
import { SummaryViewModel } from "../../../src/server/plugins/engine/models";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

suite("SummaryViewModel", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("returns the correct apiKey", async () => {
    const summaryViewModel = new SummaryViewModel();
  });
});
