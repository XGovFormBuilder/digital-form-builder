import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FeatureToggleApi } from "../client/api/toggleApi";
import { rest } from "msw";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Toggle API", () => {
  const url = "/feature-toggles";

  test("Should fetch feature toggles", async () => {
    const toggle = [{ ff_somevalue: "false" }];
    rest.get(url, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(toggle));
    });
    const result = await new FeatureToggleApi().fetch();
    expect(result).to.equal(result);
  });

  test("Should return nothing on server error", async () => {
    rest.get(url, (req, res, ctx) => {
      return res(ctx.status(500), ctx.json("Some error happened"));
    });
    const result = await new FeatureToggleApi().fetch();
    expect(result).to.equal([]);
  });
});
