import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import * as formConfigurationsApi from "../client/load-form-configurations";
import { rest } from "msw";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Load form configurations", () => {
  test("Should load configurations when returned", async () => {
    const configurations = [{ myProperty: "myValue" }];
    rest.get("/api/configurations", (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(configurations));
    });
    const returned = await formConfigurationsApi.loadConfigurations();
    expect(returned).to.equal(configurations);
  });

  test("Should return no configurations when an error occurs", async () => {
    rest.get("/api/configurations", (req, res, ctx) => {
      return res(ctx.status(500), ctx.json("Some error happened"));
    });
    const returned = await formConfigurationsApi.loadConfigurations();
    expect(returned).to.equal([]);
  });
});
