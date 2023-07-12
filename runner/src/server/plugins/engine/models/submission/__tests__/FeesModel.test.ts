import { FeesModel } from "./../FeesModel";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;
import json from "./FeesModel.test.json";
import { FormModel } from "server/plugins/engine/models";

suite("FeesModel", () => {
  test("returns correct FeesModel", () => {
    const c = {
      caz: "2",
    };

    const form = new FormModel(json, {});
    const model = FeesModel(form, c);
    expect(model).to.equal({
      details: [
        { description: "Bristol tax", amount: 5000, condition: "dFQTyf" },
        { description: "car tax", amount: 5000 },
      ],
      total: 10000,
      prefixes: [],
      referenceFormat: "FCDO-{{DATE}}",
    });
  });
  test("returns correct payment reference format when a peyment reference is supplied in the feeOptions", () => {
    const c = {
      caz: "2",
    };
    const newJson = {
      ...json,
      feeOptions: {
        paymentReferenceFormat: "FCDO2-{{DATE}}",
      },
    };
    const form = new FormModel(newJson, {});
    const model = FeesModel(form, c);
    expect(model).to.equal({
      details: [
        { description: "Bristol tax", amount: 5000, condition: "dFQTyf" },
        { description: "car tax", amount: 5000 },
      ],
      total: 10000,
      prefixes: [],
      referenceFormat: "FCDO2-{{DATE}}",
    });
  });
});
