const Code = require("@hapi/code");
const Lab = require("@hapi/lab");
const sinon = require("sinon");
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { describe, test, afterEach } = lab;
const fs = require("fs");
const jsonHelper = require("../../../bin/run/check/getJsonFiles");
const outOfDateHelper = require("../../../bin/run/check/getOutOfDateForms");

describe("check out of date forms", () => {
  test("getJsonFiles returns files with .json extension only", async () => {
    const files = await jsonHelper.getJsonFiles();
    expect(files).to.contain(["report-a-terrorist.json", "test.json"]);
    expect(files).not.to.contain(["README.md"]);
  });

  test("getOutOfDateForms detects out of date forms", async () => {
    sinon
      .stub(jsonHelper, "getJsonFiles")
      .resolves(["no-version.json", "v0.json", "v1.json", "v2.json"]);

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

  afterEach(() => {
    sinon.restore();
  });
});
