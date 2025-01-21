import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { FormModel } from "server/plugins/engine/models";
import { NonSubmittingSummaryPageController } from "server/plugins/engine/pageControllers/NonSubmittingSummaryPageController";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, it, beforeEach } = lab;

describe("NonSubmittingSummaryPageController", () => {
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
        ],
      }),
      showFilenamesOnSummaryPage: true,
      def: formDef,
    };

    mockPageDef = {
      path: "/summary",
      title: "Summary Page",
      section: "section1",
      controller: "NonSubmittingSummaryPageController",
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
          section1: { field1: "test value" },
          progress: ["/previous-page"],
          originalFilenames: {
            field1: { originalFilename: "test.pdf" },
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

    controller = new NonSubmittingSummaryPageController(
      new FormModel(formDef, {}),
      mockPageDef
    );
  });

  describe("constructor", () => {
    it("should initialize with default options when none provided", () => {
      const controllerNoOptions = new NonSubmittingSummaryPageController(
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
    });
  });

  describe("postRouteOptions", () => {
    it("should return options with onPreHandler that continues", async () => {
      const options = controller.postRouteOptions;
      const result = await options.ext.onPreHandler.method(mockRequest, mockH);

      expect(result).to.equal(mockH.continue);
    });
  });

  describe("summaryViewModel", () => {
    it("should generate correct view model with sections and rows", async () => {
      const viewModel = await controller.summaryViewModel(mockRequest);

      expect(viewModel.summaryLists).to.be.an.array();
      expect(viewModel.customText).to.equal(mockPageDef.options.customText);
    });

    it("should handle hidden section titles", async () => {
      mockModel.sections[0].hideTitle = true;
      const viewModel = await controller.summaryViewModel(mockRequest);

      expect(viewModel.summaryLists).to.be.an.array();
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
