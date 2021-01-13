import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { stubFetchJson, restoreWindowMethods } from "./helpers/window-stubbing";
import * as formConfigurationsApi from "../client/load-form-configurations";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, afterEach } = lab;

suite("Load form configurations", () => {
  afterEach(() => {
    restoreWindowMethods();
  });

  test("Should load configurations when returned", async () => {
    const configurations = [{ myProperty: "myValue" }];
    stubFetchJson(200, configurations);

    const returned = await formConfigurationsApi.loadConfigurations();

    expect(window.fetch.callCount).to.equal(1);
    expect(window.fetch.firstCall.args[0]).to.equal("/configurations");
    expect(window.fetch.firstCall.args[1]).to.equal({
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    expect(returned).to.equal(configurations);
  });

  test("Should return no configurations when an error occurs", async () => {
    stubFetchJson(500, "Some error happened");

    const returned = await formConfigurationsApi.loadConfigurations();

    expect(window.fetch.callCount).to.equal(1);
    expect(window.fetch.firstCall.args[0]).to.equal("/configurations");
    expect(window.fetch.firstCall.args[1]).to.equal({
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    expect(returned).to.equal([]);
  });
});
