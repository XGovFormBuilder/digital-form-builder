import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;
import json from "./WebhookModel.test.json";
import { FormModel, SummaryViewModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { WebhookModel } from "server/plugins/engine/models/submission";
import { newWebhookModel } from "server/plugins/engine/models/submission/WebhookModel";

const form = new FormModel(json, {});
const state: FormSubmissionState = {
  caz: "Bristol",
  registration: {
    registrationNumber: "OUTATIME",
    registrationDate: "1985-10-01",
    colour: "silver",
  },
};
const summaryViewModel = new SummaryViewModel("Summary", form, state, {
  query: {},
});

suite("WebhookModel", () => {
  test("old webhook model and new webhook model return the same values", () => {
    const relevantPages = form.pages.filter((page) => page.path !== "/summary");
    const newModel = newWebhookModel(form, relevantPages, state);
    expect(summaryViewModel._webhookData).to.equal(newModel);
  });
});
