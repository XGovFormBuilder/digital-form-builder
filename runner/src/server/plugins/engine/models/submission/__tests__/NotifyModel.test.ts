import { NotifyModel } from "../NotifyModel";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;
import json from "./NotifyModel.test.json";
import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";

const testFormSubmission = (state: FormSubmissionState) => {
  const notifyOutputConfiguration = {
    apiKey: "test",
    templateId: "test",
    emailField: "TZOHRn",
    personalisation: ["wVUZJW"],
  };

  const form = new FormModel(json, {});
  return NotifyModel(form, notifyOutputConfiguration, state);
};

suite.only("NotifyModel", () => {
  test("returns correct personalisation when a list is passed in and both conditions are satisfied", () => {
    const state: FormSubmissionState = {
      SWJtVi: true,
      dxWjPr: true,
      TZOHRn: "test@test.com",
    };
    const model = testFormSubmission(state);
    expect(model.personalisation["wVUZJW"]).to.equal(
      `* Item 1\n* Item 2\n* Item 3\n`
    );
  });
  test("returns correct personalisation when a list is passed in and the second condition is satisfied", () => {
    const state: FormSubmissionState = {
      SWJtVi: true,
      dxWjPr: false,
      TZOHRn: "test@test.com",
    };

    const model = testFormSubmission(state);

    expect(model.personalisation["wVUZJW"]).to.equal(`* Item 1\n* Item 3\n`);
  });
  test("returns correct personalisation when a list is passed in and no conditions are satisfied", () => {
    const state: FormSubmissionState = {
      SWJtVi: false,
      dxWjPr: false,
      TZOHRn: "test@test.com",
    };

    const model = testFormSubmission(state);

    expect(model.personalisation["wVUZJW"]).to.equal(`* Item 3\n`);
  });
});
