import { FormModel, SummaryViewModel } from "server/plugins/engine/models";
import config from "server/config";

const basePath = "svm-form";
const request: any = { query: {} };

const formDef = (overrides = {}) => ({
  startPage: "/first-page",
  pages: [
    {
      title: "First page",
      path: "/first-page",
      components: [
        {
          type: "TextField",
          name: "fullName",
          title: "Full name",
          options: {},
        },
      ],
      next: [{ path: "/second-page" }],
    },
    {
      title: "Second page",
      path: "/second-page",
      section: "aboutYou",
      components: [
        {
          type: "TextField",
          name: "favouriteColour",
          title: "Favourite colour",
          options: {},
          schema: { max: 10 },
        },
      ],
      next: [{ path: "/summary" }],
    },
    { title: "Summary", path: "/summary", controller: "./pages/summary.js" },
  ],
  sections: [{ name: "aboutYou", title: "About you" }],
  lists: [],
  conditions: [],
  fees: [],
  outputs: [],
  ...overrides,
});

const validState = {
  fullName: "Ada Lovelace",
  aboutYou: { favouriteColour: "Green" },
};

const build = (state: any, defOverrides = {}) =>
  new SummaryViewModel(
    "Check your answers",
    new FormModel(formDef(defOverrides), { basePath }),
    state,
    request
  );

describe("SummaryViewModel", () => {
  describe("details", () => {
    test("groups answers into unsectioned and sectioned summary lists", () => {
      const { details } = build(validState);

      expect(details).toHaveLength(2);
      expect(details[0].name).toBeUndefined();
      expect(details[0].items.map((item) => item.name)).toEqual(["fullName"]);
      expect(details[1].name).toBe("aboutYou");
      expect(details[1].title).toBe("About you");
      expect(details[1].items.map((item) => item.name)).toEqual([
        "favouriteColour",
      ]);
    });

    test("builds each item from the component and the answer", () => {
      const [item] = build(validState).details[1].items;

      expect(item).toMatchObject({
        name: "favouriteColour",
        label: "Favourite colour",
        title: "Favourite colour",
        value: "Green",
        rawValue: "Green",
        path: "/second-page",
        pageId: `/${basePath}/second-page`,
        type: "TextField",
      });
    });

    test("links each item back to its page, returning to the summary", () => {
      const [item] = build(validState).details[0].items;
      const url = new URL(item.url, "http://localhost");

      expect(url.pathname).toBe(`/${basePath}/first-page`);
      expect(url.searchParams.get("returnUrl")).toBe(`/${basePath}/summary`);
    });
  });

  describe("when the answers are valid", () => {
    test("has no errors and builds the webhook data", () => {
      const viewModel = build(validState);

      expect(viewModel.errors).toBeUndefined();
      expect(viewModel._webhookData).toBeDefined();
      expect(viewModel._webhookData?.questions?.length).toBeGreaterThan(0);
    });

    test("builds outputs when the form defines them", () => {
      const viewModel = build(validState, {
        outputs: [
          {
            name: "webhook",
            title: "Webhook",
            type: "webhook",
            outputConfiguration: { url: "https://example.org/hook" },
          },
        ],
      });

      expect(viewModel.outputs).toHaveLength(1);
      expect(viewModel.outputs[0].outputData.url).toBe(
        "https://example.org/hook"
      );
    });

    test("skips outputs when the session came from a callback", () => {
      const viewModel = build(
        { ...validState, callback: { callbackUrl: "https://example.org" } },
        {
          outputs: [
            {
              name: "webhook",
              title: "Webhook",
              type: "webhook",
              outputConfiguration: { url: "https://example.org/hook" },
            },
          ],
        }
      );

      expect(viewModel.outputs).toBeUndefined();
    });
  });

  describe("when an answer is invalid", () => {
    const invalidState = {
      fullName: "Ada Lovelace",
      aboutYou: { favouriteColour: "Ultramarine blue" },
    };

    test("records the error and marks only that item as in error", () => {
      const viewModel = build(invalidState);

      expect(viewModel.errors?.map((err) => err.path)).toEqual([
        "aboutYou.favouriteColour",
      ]);
      expect(viewModel.details[1].items[0].inError).toBe(true);
      expect(viewModel.details[0].items[0].inError).toBeUndefined();
    });

    test("does not build webhook data or outputs", () => {
      const viewModel = build(invalidState);

      expect(viewModel._webhookData).toBeUndefined();
      expect(viewModel.outputs).toBeUndefined();
    });
  });

  describe("form-level settings", () => {
    test("copies the declaration and skipSummary settings from the form", () => {
      const viewModel = build(validState, {
        declaration: "I confirm my answers are correct",
        skipSummary: true,
      });

      expect(viewModel.declaration).toBe("I confirm my answers are correct");
      expect(viewModel.skipSummary).toBe(true);
    });

    test("sets the return URL to the form's summary page", () => {
      expect(build(validState).returnUrl).toBe(`/${basePath}/summary`);
    });

    test("uses the form's feedback URL when one is set", () => {
      const viewModel = build(validState, {
        feedback: { url: "https://example.org/feedback" },
      });

      expect(viewModel.feedbackLink).toBe("https://example.org/feedback");
    });

    test("uses a mailto link when only a feedback email address is set", () => {
      const viewModel = build(validState, {
        feedback: { emailAddress: "feedback@example.org" },
      });

      expect(viewModel.feedbackLink).toBe("mailto:feedback@example.org");
    });

    test("falls back to the configured feedback link", () => {
      expect(build(validState).feedbackLink).toBe(config.feedbackLink);
    });
  });

  describe("webhook helpers", () => {
    test("adds the declaration as an answered question", () => {
      const viewModel = build(validState);
      viewModel.addDeclarationAsQuestion();

      expect(viewModel._webhookData?.questions?.at(-1)).toEqual({
        category: null,
        question: "Declaration",
        fields: [
          {
            key: "declaration",
            title: "Declaration",
            type: "boolean",
            answer: true,
          },
        ],
      });
    });

    test("adds a reference as an answered question", () => {
      const viewModel = build(validState);
      viewModel.addReferenceToWebhook("ABC-123");

      expect(viewModel._webhookData?.questions?.at(-1)?.fields[0]).toEqual({
        key: "reference",
        title: "Reference",
        type: "string",
        answer: "ABC-123",
      });
    });

    test("has an empty payment reference when the form has no fees", () => {
      const viewModel = build(validState);
      viewModel.webhookDataPaymentReference = "PAY-1";

      expect(viewModel.webhookDataPaymentReference).toBe("");
    });
  });
});
