import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { describe, test, after } = lab;
import fs from "fs";
import * as jsonHelper from "../../../bin/run/check/getJsonFiles";
import * as outOfDateHelper from "../../../bin/run/check/getOutOfDateForms";
describe("check out of date forms", () => {
  test("getJsonFiles returns files with .json extension only", async () => {
    const files = await jsonHelper.getJsonFiles();
    expect(files).to.contain(["report-a-terrorist.json", "test.json"]);
    expect(files).not.to.contain(["README.md"]);
  });

  test("getOutOfDateForms detects out of date forms", async () => {
    const fake = sinon.fake.returns([
      "no-version.json",
      "v0.json",
      "v1.json",
      "v2.json",
    ]);

    sinon.replace(jsonHelper, "getJsonFiles", fake);
    const fsStub = sinon.stub(fs.promises, "readFile");
    fsStub.onCall(0).returns("{}");
    fsStub.onCall(1).returns(`{ "version": 0 }`);
    fsStub.onCall(2).returns(`{ "version": 1 }`);
    fsStub.onCall(3).returns(`{ "version": 2 }`);

    expect(await outOfDateHelper.getOutOfDateForms()).to.contain([
      "no-version.json",
      "v0.json",
      "v1.json",
    ]);
  });

  after(() => {
    sinon.restore();
  });
});
