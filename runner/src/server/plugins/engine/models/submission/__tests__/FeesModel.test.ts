import { FeesModel, ReportingColumns } from "./../FeesModel";
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
    const state = {
      caz: "2",
    };

    const form = new FormModel(json, {});
    const model = FeesModel(form, state);
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
    const state = {
      caz: "2",
    };
    const newJson = {
      ...json,
      feeOptions: {
        paymentReferenceFormat: "FCDO2-{{DATE}}",
      },
    };
    const form = new FormModel(newJson, {});
    const model = FeesModel(form, state);
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
  test("returns correct payment reference format when a peyment reference is supplied in the feeOptions", () => {
    const newJson = {
      ...json,
      feeOptions: {
        paymentReferenceFormat: "FCDO2-{{DATE}}",
        additionalReportingColumns: [
          {
            columnName: "zone",
            fieldValue: "caz",
          },
        ],
      },
    };
    const form = new FormModel(newJson, {});

    const state = {
      caz: "2",
    };

    const model = FeesModel(form, state);
    expect(model).to.equal({
      details: [
        { description: "Bristol tax", amount: 5000, condition: "dFQTyf" },
        { description: "car tax", amount: 5000 },
      ],
      total: 10000,
      prefixes: [],
      referenceFormat: "FCDO2-{{DATE}}",
      reportingColumns: {
        zone: "2",
      },
    });
  });
});

suite("ReportingColumns", () => {
  const additionalReportingColumns = [
    {
      columnName: "country",
      fieldValue: "beforeYouStart.country",
    },
    {
      columnName: "post",
      fieldValue: "post",
    },
    {
      columnName: "service",
      staticValue: "fee 11",
    },
  ];

  test("Returns the correct metadata for GOV.UK Pay", () => {
    expect(
      ReportingColumns(additionalReportingColumns, {
        beforeYouStart: {
          country: "Italy",
        },
        post: "British Embassy Rome",
      })
    ).to.equal({
      country: "Italy",
      post: "British Embassy Rome",
      service: "fee 11",
    });
  });

  test("Does not add a reporting column when the state value is missing for a nested state value", () => {
    expect(
      ReportingColumns(additionalReportingColumns, { post: "A" })
    ).to.equal({ post: "A", service: "fee 11" });
  });

  test("Does not add a reporting column when the state value is missing for an un-nested", () => {
    expect(
      ReportingColumns(additionalReportingColumns, {
        beforeYouStart: {
          country: "Italy",
        },
      })
    ).to.equal({
      country: "Italy",
      service: "fee 11",
    });
  });

  test("Adds static values", () => {
    expect(ReportingColumns(additionalReportingColumns, {})).to.equal({
      service: "fee 11",
    });
  });
});
