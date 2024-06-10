import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;
import json from "./WebhookModel.test.json";
import { FormModel, SummaryViewModel } from "server/plugins/engine/models";
import { WebhookModel } from "server/plugins/engine/models/submission";
import { newWebhookModel } from "server/plugins/engine/models/submission/WebhookModel";
const form = new FormModel(json, {});

const state = {
  progress: [],
  checkBeforeYouStart: {
    ukPassport: true,
  },
  applicantDetails: {
    numberOfApplicants: 2,
    phoneNumber: "123",
    emailAddress: "a@b",
    languagesProvided: ["fr", "it"],
    contactDate: "2024-12-25T00:00:00.000Z",
  },
  applicantOneDetails: {
    firstName: "Winston",
    lastName: "Smith",
    address: {
      addressLine1: "1 Street",
      town: "London",
      postcode: "ec2a4ps",
    },
  },
  applicantTwoDetails: {
    firstName: "big",
    lastName: "brother",
    address: {
      addressLine1: "2 Street",
      town: "London",
      postcode: "ec2a4ps",
    },
  },
};

const summaryViewModel = new SummaryViewModel(
  "summary",
  form,
  { ...state },
  {
    query: {},
  }
);

suite("WebhookModel", () => {
  test("SummaryViewModel returns correct WebhookModel", () => {
    const webhookData = summaryViewModel._webhookData;
    expect(webhookData).to.equal(expectedWebhookData);
  });

  test("WebhookModel returns correct webhook model", () => {
    const { relevantPages } = form.getRelevantPages({ ...state });
    const details = summaryViewModel.details;
    const webhookModel = WebhookModel(
      relevantPages,
      details,
      form,
      undefined,
      state
    );
    expect(webhookModel).to.equal(expectedWebhookData);
  });

  test("newWebhookModel returns correct webhook model", () => {
    expect(newWebhookModel(form, state)).to.equal(expectedWebhookData);
  });
});

const expectedWebhookData = {
  name: "Digital Form Builder - Runner undefined",
  metadata: undefined,
  questions: [
    {
      category: "checkBeforeYouStart",
      question: "Do you have a UK passport?",
      fields: [
        {
          key: "ukPassport",
          title: "Do you have a UK passport?",
          type: "list",
          answer: true,
        },
      ],
      index: 0,
    },
    {
      category: "applicantDetails",
      question: "How many applicants are there?",
      fields: [
        {
          key: "numberOfApplicants",
          title: "How many applicants are there?",
          type: "list",
          answer: 2,
        },
      ],
      index: 0,
    },
    {
      category: "applicantOneDetails",
      question: "Applicant 1",
      fields: [
        {
          key: "firstName",
          title: "First name",
          type: "text",
          answer: "Winston",
        },
        {
          key: "middleName",
          answer: undefined,
          title: "Middle name",
          type: "text",
        },
        {
          key: "lastName",
          title: "Surname",
          type: "text",
          answer: "Smith",
        },
      ],
      index: 0,
    },
    {
      category: "applicantOneDetails",
      question: "Address",
      fields: [
        {
          key: "address",
          title: "Address",
          type: "text",
          answer: "1 Street, London, ec2a4ps",
        },
      ],
      index: 0,
    },
    {
      category: "applicantTwoDetails",
      question: "Applicant 2",
      fields: [
        {
          key: "firstName",
          title: "First name",
          type: "text",
          answer: "big",
        },
        {
          key: "middleName",
          answer: undefined,
          title: "Middle name",
          type: "text",
        },
        {
          key: "lastName",
          title: "Surname",
          type: "text",
          answer: "brother",
        },
      ],
      index: 0,
    },
    {
      category: "applicantTwoDetails",
      question: "Address",
      fields: [
        {
          key: "address",
          title: "Address",
          type: "text",
          answer: "2 Street, London, ec2a4ps",
        },
      ],
      index: 0,
    },
    {
      category: "applicantDetails",
      fields: [
        {
          answer: ["fr", "it"],
          key: "languagesProvided",
          title: "Language",
          type: "list",
        },
      ],
      index: 0,
      question: "Which languages do you speak?",
    },
    {
      category: "applicantDetails",
      question: "Applicant contact details",
      fields: [
        {
          key: "phoneNumber",
          title: "Phone number",
          type: "text",
          answer: "123",
        },
        {
          key: "emailAddress",
          title: "Your email address",
          type: "text",
          answer: "a@b",
        },
        {
          answer: "2024-12-25",
          key: "contactDate",
          title: "Contact date",
          type: "date",
        },
      ],
      index: 0,
    },
  ],
};
