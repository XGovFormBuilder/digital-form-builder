import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { loadPreConfiguredForms } from "../../../../../../src/server/plugins/engine/services/configurationService";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Engine Plugin ConfigurationService", () => {
  test("it loads pre-configured forms configuration correctly ", () => {
    const testFormJSON = require("../../../../../../src/server/forms/test.json");
    const result = loadPreConfiguredForms();

    expect(result).to.equal([
      {
        configuration: testFormJSON,
        id: "test",
      },
    ]);
  });
});
