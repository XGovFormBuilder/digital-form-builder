import { FormModel, SummaryViewModel } from "server/plugins/engine/models";
import { summaryDetailsTransformationMap } from "../SummaryViewModel.detailsTransformationMap";

jest.mock("../SummaryViewModel.detailsTransformationMap", () => ({
  summaryDetailsTransformationMap: {
    "svm-test": jest.fn((value) => ({ ...value, transformed: true })),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

test("it transforms the details if a transformation exists", () => {
  const basePath = "svm-test";
  const formModel = new FormModel(formDef, { basePath });

  const summaryViewModel = new SummaryViewModel(
    "summary",
    formModel,
    {
      favouriteEgg: "scrambled",
    },
    { query: jest.fn() }
  );

  const details = summaryViewModel.details;

  expect(details[0].items[0].title).toStrictEqual(
    "What is your favourite egg?"
  );
  expect(details[0].items[0].value).toStrictEqual("scrambled");

  expect(summaryDetailsTransformationMap["svm-test"]).toHaveBeenCalled();
  expect(details.transformed).toStrictEqual(true);
});

test("it does not transform the details if a transformation does not exist", () => {
  const basePath = "some-other-path";
  const formModel = new FormModel(formDef, { basePath });

  const summaryViewModel = new SummaryViewModel(
    "summary",
    formModel,
    {
      favouriteEgg: "scrambled",
    },
    { query: jest.fn() }
  );
  const details = summaryViewModel.details;
  expect(summaryDetailsTransformationMap["svm-test"]).not.toHaveBeenCalled();
  expect(summaryDetailsTransformationMap[basePath]).toBeUndefined();
  expect(details[0].items[0].value).toStrictEqual("scrambled");
  expect(details.transformed).toBeUndefined();
});

const formDef = {
  startPage: "/first-page",
  pages: [
    {
      title: "First page",
      path: "/first-page",
      components: [
        {
          type: "TextField",
          name: "favouriteEgg",
          title: "What is your favourite egg?",
        },
      ],
      next: [
        {
          path: "/summary",
        },
      ],
    },
    {
      title: "summary",
      path: "/summary",
      controller: "SummaryPageController",
    },
  ],
  sections: [],
  lists: [],
  conditions: [],
};
