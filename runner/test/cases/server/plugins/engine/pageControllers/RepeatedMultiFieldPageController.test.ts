import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { RepeatedMultiFieldPageController } from "server/plugins/engine/pageControllers/RepeatedMultiFieldPageController";
import { FormModel } from "src/server/plugins/engine/models/FormModel";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

const emptyModel = new FormModel(
  {
    pages: [],
    startPage: "/start",
    sections: [],
    lists: [],
    conditions: [],
  },
  {}
);

const pageDef = {
  path: "/which-languages-do-you-translate-or-interpret",
  name: "",
  options: {
    sectionKey: "people_you_live_with",
  },
  components: [
    {
      name: "Name",
      type: "TextField",
      title: "Your name",
      schema: {},
      options: {},
    },
  ],
  next: [],
};

suite("RepeatedMultiFieldPageController", () => {
  test("toWebhookQuestions renders the page title", () => {
    const page = new RepeatedMultiFieldPageController(emptyModel, {
      ...pageDef,
      title: "Select Interpreters",
    } as any);

    const [question] = page.toWebhookQuestions({
      people_you_live_with: [{ Name: "Alice" }],
    });

    expect(question.question).to.equal("Select Interpreters");
  });

  test("toWebhookQuestions does not crash for a page without a title", () => {
    const page = new RepeatedMultiFieldPageController(
      emptyModel,
      pageDef as any
    );

    const [question] = page.toWebhookQuestions({
      people_you_live_with: [{ Name: "Alice" }],
    });

    expect(question.question).to.equal("");
  });
});

suite("RepeatedMultiFieldPageController field change links", () => {
  const state = { people_you_live_with: [{ Name: "Alice" }, { Name: "Bob" }] };

  const pageWithOptions = (options = {}) =>
    new RepeatedMultiFieldPageController(emptyModel, {
      ...pageDef,
      options: { ...pageDef.options, ...options },
    } as any);

  const immutableFlags = (cards) =>
    cards.flatMap((card) => card.items.map((item) => item.immutable));

  // The final summary page calls toSummaryDetails without a context.
  const onMainSummary = (page) => immutableFlags(page.toSummaryDetails(state));
  const onRepeatSummary = (page) =>
    immutableFlags(page.toSummaryDetails(state, "repeat"));

  test("field change links show on both summaries by default", () => {
    const page = pageWithOptions();

    expect(onRepeatSummary(page)).to.equal([false, false]);
    expect(onMainSummary(page)).to.equal([false, false]);
  });

  test("hideFieldChangeLinksOnRepeatSummary hides them only on the repeat summary", () => {
    const page = pageWithOptions({ hideFieldChangeLinksOnRepeatSummary: true });

    expect(onRepeatSummary(page)).to.equal([true, true]);
    expect(onMainSummary(page)).to.equal([false, false]);
  });

  test("hideFieldChangeLinksOnMainSummary hides them only on the main summary", () => {
    const page = pageWithOptions({ hideFieldChangeLinksOnMainSummary: true });

    expect(onRepeatSummary(page)).to.equal([false, false]);
    expect(onMainSummary(page)).to.equal([true, true]);
  });
});
