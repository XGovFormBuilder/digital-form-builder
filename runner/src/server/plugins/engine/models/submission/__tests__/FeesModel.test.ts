import { FeesModel } from "./../FeesModel";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;
import json from "./FeesModel.test.json";
import { FormModel } from "server/plugins/engine/models";

suite.only("FeesModel", () => {
  test("returns correct FeesModel", () => {
    const c = {
      caz: "2",
    };

    const form = new FormModel(json, {});
    const model = FeesModel(form, c);
    expect(model).to.equal({
      details: [
        {
          description: "Bristol tax",
          amount: 5000,
          condition: "dFQTyf",
          multiplier: "numberOfCars",
        },
        {
          description: "car tax",
          amount: 5000,
          multiplier: "2",
          multiplyBy: 2,
        },
      ],
      total: 15000,
      prefixes: [],
      referenceFormat: "FCDO-{{DATE}}",
    });
  });
  test("returns correct total for a fee with a static quantity", () => {
    const c = {
      caz: "1",
      numberOfCars: "4",
    };

    const form = new FormModel(json, {});
    const model = FeesModel(form, c);
    expect(model?.total).to.equal(10000);
  });
  test("returns correct total for a fee with a dynamic quantity", () => {
    const c = {
      caz: "2",
      numberOfCars: "4",
    };

    const form = new FormModel(json, {});
    const model = FeesModel(form, c);
    expect(model?.total).to.equal(30000);
  });
});
