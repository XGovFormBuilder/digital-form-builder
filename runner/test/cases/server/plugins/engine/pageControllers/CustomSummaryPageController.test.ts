import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FormModel } from "server/plugins/engine/models";
import { CustomSummaryPageController } from "server/plugins/engine/pageControllers/CustomSummaryPageController";
import { PageControllerBase } from "server/plugins/engine/pageControllers/PageControllerBase";
import { FormSubmissionState } from "server/plugins/engine/types";
import { HapiRequest } from "server/types";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

type SummaryRow = { key: { text: string }; value: { text: string } };
type SummaryList = { rows: SummaryRow[] };

const textField = (name: string, title: string) => ({
  name,
  title,
  type: "TextField",
  options: {},
  schema: {},
});

const def = {
  startPage: "/region",
  pages: [
    {
      path: "/region",
      title: "Region",
      components: [textField("region", "Region")],
      next: [{ path: "/setting" }],
    },
    {
      path: "/setting",
      title: "Setting",
      section: "settingDetails",
      components: [textField("settingName", "Setting name")],
      next: [{ path: "/summary" }],
    },
    {
      path: "/summary",
      title: "Check your answers",
      controller: "CustomSummaryPageController",
      components: [],
    },
  ],
  sections: [{ name: "settingDetails", title: "Setting details" }],
  lists: [],
  conditions: [],
  outputs: [],
  name: "Root and section answers",
};

const summaryAnswers = async (state: FormSubmissionState) => {
  const model = new FormModel(def, { basePath: "root-and-section" });
  const summaryPage = model.pages.find(
    (page: PageControllerBase) => page.path === "/summary"
  ) as CustomSummaryPageController;
  // summaryViewModel only reads the request to get the state from the cache service.
  const request = {
    services: () => ({ cacheService: { getState: async () => state } }),
  } as unknown as HapiRequest;

  const { summaryLists } = await summaryPage.summaryViewModel(request);

  return Object.fromEntries(
    (summaryLists as SummaryList[])
      .flatMap((list) => list.rows)
      .map((row) => [row.key.text, row.value.text])
  );
};

suite("CustomSummaryPageController answers at the root and in sections", () => {
  test("an answer to a question outside a section is read from the root of the state", async () => {
    const answers = await summaryAnswers({ region: "London" });

    expect(answers.Region).to.equal("London");
  });

  test("an answer to a question in a section is read from that section", async () => {
    const answers = await summaryAnswers({
      settingDetails: { settingName: "Oak House" },
    });

    expect(answers["Setting name"]).to.equal("Oak House");
  });

  test("a value at the root is not shown for a question in a section", async () => {
    const withEmptySection = await summaryAnswers({
      settingName: "Root value",
      settingDetails: {},
    });
    const withoutSection = await summaryAnswers({ settingName: "Root value" });

    expect(withEmptySection["Setting name"]).to.equal("Not supplied");
    expect(withoutSection["Setting name"]).to.equal("Not supplied");
  });
});
