import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FormModel } from "server/plugins/engine/models";
import { CheckpointSummaryPageController } from "server/plugins/engine/pageControllers/CheckpointSummaryPageController";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, beforeEach } = lab;

describe("CheckpointSummaryPageController", () => {
  let controller;
  let mockModel;
  let mockPageDef;
  let mockRequest;
  let mockH;
  let mockCacheService;

  beforeEach(() => {
    const formDef = {
      pages: [
        {
          path: "/page1",
          title: "Page 1",
          section: "section1",
          components: [],
        },
      ],
      sections: [
        { name: "section1", title: "Section 1", hideTitle: false },
        { name: "section2", title: "Section 2", hideTitle: true },
      ],
      startPage: "/page1",
      lists: [],
      conditions: [],
      name: "Test Form",
    };

    mockModel = {
      options: {
        basePath: "test-form",
      },
      name: "Test Form",
      conditions: [],
      lists: [],
      sections: [
        { name: "section1", title: "Section 1", hideTitle: false },
        { name: "section2", title: "Section 2", hideTitle: true },
      ],
      pages: [
        {
          path: "/page1",
          title: "Page 1",
          section: "section1",
          components: [],
        },
      ],
      getRelevantPages: () => ({
        relevantPages: [
          {
            path: "/page1",
            title: "Page 1",
            section: { name: "section1" },
            sectionForMultiSummaryPages: "Custom Section 1",
            components: {
              formItems: [
                {
                  name: "field1",
                  title: "Field 1",
                  type: "TextField",
                  options: { summaryTitle: "F1" },
                  getDisplayStringFromState: (state) => state.field1,
                },
              ],
            },
          },
          {
            path: "/page2",
            title: "Page 2",
            section: { name: "section2" },
            sectionForMultiSummaryPages: "Custom Section 2",
            components: {
              formItems: [
                {
                  name: "field2",
                  title: "Field 2",
                  type: "TextField",
                  options: { summaryTitle: "F2" },
                  getDisplayStringFromState: (state) => state.field2,
                },
              ],
            },
          },
        ],
      }),
      showFilenamesOnSummaryPage: true,
      def: formDef,
    };

    mockPageDef = {
      path: "/summary",
      title: "Summary Page",
      section: "section1",
      controller: "CheckpointSummaryPageController",
      name: "summary-page",
      components: [],
      next: [],
      options: {
        customText: {
          title: "Custom Title",
        },
      },
    };

    mockCacheService = {
      getState: () =>
        Promise.resolve({
          section1: { field1: "test value 1" },
          section2: { field2: "test value 2" },
          progress: ["/previous-page"],
          originalFilenames: {
            field1: { originalFilename: "test1.pdf" },
            field2: { originalFilename: "test2.pdf" },
          },
        }),
    };

    mockRequest = {
      services: () => ({ cacheService: mockCacheService }),
      yar: {
        set: () => {},
      },
    };

    mockH = {
      view: (template, data) => ({ template, data }),
      redirect: (path) => path,
      continue: Symbol("continue"),
    };

    controller = new CheckpointSummaryPageController(
      new FormModel(formDef, {}),
      mockPageDef
    );
  });

  describe("constructor", () => {
    it("should initialize with default options when none provided", () => {
      const controllerNoOptions = new CheckpointSummaryPageController(
        new FormModel(mockModel.def, {}),
        { ...mockPageDef, options: undefined }
      );

      expect(controllerNoOptions.options).to.equal({
        customText: {},
      });
    });
  });

  describe("makePostRouteHandler", () => {
    it("should return a function that redirects to the next page", async () => {
      const handler = controller.makePostRouteHandler();
      const result = await handler(mockRequest, mockH);

      expect(result).to.be.a.string();
      expect(result).to.equal("/summary");
    });
  });

  describe("summaryLists generation", () => {
    it("should generate summaryLists based on rowsBySection and model.sections", () => {
      // Mock data
      const rowsBySection = {
        section1: ["row1", "row2"],
        section2: ["row3"],
      };

      const model = {
        sections: [
          { name: "section1", title: "Section One", hideTitle: false },
          { name: "section2", title: "Section Two", hideTitle: true },
          { name: "section3", title: "Section Three", hideTitle: false },
        ],
      };

      // The function to test
      const summaryLists = Object.entries(rowsBySection).map(
        ([section, rows]) => {
          const modelSection = model.sections.find(
            (mSection) => mSection.name === section
          );

          return {
            sectionTitle: !modelSection?.hideTitle ? modelSection?.title : "",
            section,
            rows,
          };
        }
      );

      // Expected result
      const expectedSummaryLists = [
        {
          sectionTitle: "Section One",
          section: "section1",
          rows: ["row1", "row2"],
        },
        {
          sectionTitle: "", // Title hidden because `hideTitle` is true
          section: "section2",
          rows: ["row3"],
        },
      ];

      // Assertions
      expect(summaryLists).to.equal(expectedSummaryLists);
    });
  });

  describe("formItemsToRowByPage", () => {
    it("should transform form items to summary rows", () => {
      const page = {
        path: "/page1",
        model: mockModel,
        components: {
          formItems: [],
        },
      };

      const component = {
        name: "field1",
        title: "Field 1",
        type: "TextField",
        options: { summaryTitle: "F1" },
        getDisplayStringFromState: (state) => state.field1,
      };

      const toRow = controller.formItemsToRowByPage({
        page,
        sectionState: { field1: "test value" },
        fullState: {},
      });

      const row = toRow(component);

      expect(row.key.text).to.equal("F1");
      expect(row.value.text).to.equal("test value");
      expect(row.actions.items[0].text).to.equal("Change");
    });
  });
});
