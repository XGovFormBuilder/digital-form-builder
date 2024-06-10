import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { WebhookModel } from "../../../../../src/server/plugins/engine/models/submission/WebhookModel";
import form from "./SummaryViewModel.json";
import welshForm from "./WelshSummaryViewModel.json";
import {
  FormModel,
  SummaryViewModel,
} from "../../../../../src/server/plugins/engine/models";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, suite, test } = lab;

const testDetails = [
  {
    items: [
      {
        name: "approximate",
        path: "/first-page",
        label: "Approximate date of marriage",
        value: "January 2000",
        rawValue: {
          approximate__month: 1,
          approximate__year: 2000,
        },
        url: "/test/first-page?returnUrl=%2Ftest%2Fsummary",
        pageId: "/test/first-page",
        type: "MonthYearField",
        title: "Approximate date of marriage",
        dataType: "monthYear",
        prefix: undefined,
      },
      {
        name: "caz",
        path: "/first-page",
        label: "caz zone",
        value: "Bath",
        rawValue: "1",
        url: "/test/first-page?returnUrl=%2Ftest%2Fsummary",
        pageId: "/test/first-page",
        type: "SelectField",
        title: "caz zone",
        dataType: "list",
        prefix: undefined,
      },
    ],
    name: undefined,
    title: undefined,
    notSuppliedText: "Not supplied",
    changeText: "Change",
  },
  {
    name: "aSection",
    title: "Named Section",
    notSuppliedText: "Not supplied",
    changeText: "Change",
    items: [
      {
        name: "fullDate",
        path: "/second-page",
        label: "full date (optional)",
        value: "11 December 2000",
        rawValue: "2000-12-11T00:00:00.000Z",
        url: "/test/second-page?returnUrl=%2Ftest%2Fsummary",
        pageId: "/test/second-page",
        type: "DatePartsField",
        title: "full date",
        dataType: "date",
        prefix: undefined,
      },
    ],
  },
];

suite("WebhookModel", () => {
  afterEach(() => {
    sinon.restore();
  });
  const formModel = new FormModel(form, {});
  formModel.basePath = "test";
  formModel.name = "My Service";
  const viewModel = new SummaryViewModel(
    "summary",
    formModel,
    {
      progress: ["/test/first-page", "/test/second-page"],
      approximate: {
        approximate__month: 1,
        approximate__year: 2000,
      },
      caz: "1",
      aSection: {
        fullDate: "2000-12-11T00:00:00.000Z",
      },
    },
    {
      app: {
        location: "/",
      },
      query: {},
      state: {
        cookie_policy: {},
      },
    }
  );

  const welshFormModel = new FormModel(welshForm, {});
  welshFormModel.basePath = "test";
  welshFormModel.name = "My Service";
  const welshViewModel = new SummaryViewModel(
    "summary",
    welshFormModel,
    {
      progress: ["/test/first-page", "/test/second-page"],
      approximate: {
        approximate__month: 1,
        approximate__year: 2000,
      },
      caz: "1",
      aSection: {
        fullDate: "2000-12-11T00:00:00.000Z",
      },
    },
    {
      app: {
        location: "/",
      },
      query: {},
      state: {
        cookie_policy: {},
      },
    }
  );

  test("parses Details correctly", () => {
    expect(viewModel.details).to.equal(testDetails);

    const parsed = WebhookModel(
      formModel.pages.filter((page) => page.path !== "/summary"),
      viewModel.details,
      formModel
    );
    expect(parsed).to.equal({
      metadata: { has_eligibility: false },
      name: "My Service",
      questions: [
        {
          category: undefined,
          fields: [
            {
              answer: "2000-01",
              key: "approximate",
              title: "Approximate date of marriage",
              type: "monthYear",
            },
            {
              answer: "1",
              key: "caz",
              title: "caz zone",
              type: "list",
            },
          ],
          index: 0,
          question: "When will you get married?",
        },
        {
          category: "aSection",
          fields: [
            {
              answer: "2000-12-11",
              key: "fullDate",
              title: "full date",
              type: "date",
            },
          ],
          index: 0,
          question: "Second page",
        },
      ],
    });
  });
  test("parses welsh Details correctly", () => {
    expect(welshViewModel.details[0].notSuppliedText).to.equal(
      "Heb ei ddarparu"
    );
  });
});
