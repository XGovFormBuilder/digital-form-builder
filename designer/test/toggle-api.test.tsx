import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { stubFetchJson, restoreWindowMethods } from "./helpers/window-stubbing";
import { FeatureToggleApi } from "../client/api/toggleApi";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, afterEach } = lab;

suite("Toggle API", () => {
  afterEach(() => {
    restoreWindowMethods();
  });

  test("Should fetch feature toggles", async () => {
    const toggle = [{ ff_somevalue: "false" }];
    stubFetchJson(200, toggle);

    const result = await new FeatureToggleApi().fetch();

    expect(window.fetch.callCount).to.equal(1);
    expect(window.fetch.firstCall.args[0]).to.equal("/feature-toggles");

    expect(result).to.equal(result);
  });

  test("Should return nothing on server error", async () => {
    stubFetchJson(500, "Some error happened");

    const result = await new FeatureToggleApi().fetch();

    expect(window.fetch.callCount).to.equal(1);
    expect(window.fetch.firstCall.args[0]).to.equal("/feature-toggles");

    expect(result).to.equal([]);
  });
});
