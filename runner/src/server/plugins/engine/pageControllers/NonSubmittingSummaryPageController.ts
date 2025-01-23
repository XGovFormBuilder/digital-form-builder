import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "server/plugins/engine/pageControllers/PageController";

import { FormComponent } from "server/plugins/engine/components";
import { PageControllerBase } from "server/plugins/engine/pageControllers/PageControllerBase";
import { FormModel } from "server/plugins/engine/models";
import { NonSubmittingSummaryPage } from "@xgovformbuilder/model";

const DEFAULT_OPTIONS = {
  customText: {},
};

export class NonSubmittingSummaryPageController extends PageController {
  returnUrlParameter: string;
  options: NonSubmittingSummaryPage["options"];

  constructor(model: FormModel, pageDef: NonSubmittingSummaryPage) {
    super(model, pageDef);

    const returnPath = `/${this.model.basePath}${this.path}`;
    this.returnUrlParameter = `?returnUrl=${encodeURIComponent(returnPath)}`;
    this.options = pageDef?.options ?? DEFAULT_OPTIONS;
    this.options.customText ??= DEFAULT_OPTIONS.customText;
  }
  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
   */
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.langFromRequest(request);

      const viewModel = await this.summaryViewModel(request);

      return h.view("non-submitting-summary", viewModel);
    };
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const model = this.model;
      const state = await cacheService.getState(request);

      request.yar.set("basePath", model.basePath);

      const nextPage = this.getNext(state);
      return h.redirect(nextPage);
    };
  }

  get postRouteOptions() {
    return {
      ext: {
        onPreHandler: {
          method: async (_request: HapiRequest, h: HapiResponseToolkit) => {
            return h.continue;
          },
        },
      },
    };
  }

  async summaryViewModel(request: HapiRequest) {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const { progress = [] } = state;

    const { relevantPages } = this.model.getRelevantPages(state);

    const rowsBySection = relevantPages.reduce((prev, page) => {
      let displaySectionName;
      if (this.options?.multiSummary) {
        // Use sectionForMultiSummaryPages, otherwise use section name
        displaySectionName =
          page.sectionForMultiSummaryPages || page.section?.name;
      } else {
        // Use sectionForSummaryPages for grouping if available, otherwise use section name
        displaySectionName = page.sectionForSummaryPages || page.section?.name;
      }

      // Always use section name for state access
      const stateSectionName = page.section?.name;

      const section = prev[displaySectionName] ?? [];
      let sectionState = stateSectionName
        ? state[stateSectionName] || {}
        : state;

      const toRow = this.formItemsToRowByPage({
        page,
        sectionState,
        fullState: state,
      });

      section.push(...page.components.formItems.map(toRow));

      prev[displaySectionName] = section;
      return prev;
    }, {});

    const summaryLists = Object.entries(rowsBySection).map(
      ([section, rows]) => {
        const modelSection = this.model.sections.find(
          (mSection) => mSection.name === section
        );

        return {
          sectionTitle: !modelSection?.hideTitle ? modelSection?.title : "",
          section,
          rows,
        };
      }
    );

    return {
      page: this,
      pageTitle: this.title,
      sectionTitle: this.section?.title,
      backLink: progress[progress.length - 1] ?? this.backLinkFallback,
      name: this.model.name,
      summaryLists,
      showTitle: true,
      customText: this.options.customText,
    };
  }

  formItemsToRowByPage({
    page,
    sectionState,
    fullState,
  }: {
    page: PageControllerBase;
    sectionState: { [key: string]: any };
    fullState: { [key: string]: any };
  }) {
    const pagePath = `/${page.model.basePath}${page.path}`;
    const returnPath = `${pagePath}${this.returnUrlParameter}`;
    const model = this.model;
    return function (component: FormComponent) {
      let valueText = component.getDisplayStringFromState(sectionState);

      if (
        component.type === "FileUploadField" &&
        model.showFilenamesOnSummaryPage
      ) {
        valueText =
          fullState.originalFilenames?.[component.name]?.originalFilename;
      }

      return {
        key: {
          text: component.options.summaryTitle ?? component.title,
        },
        value: {
          text: valueText || "Not supplied",
        },
        actions: {
          items: [
            {
              text: "Change",
              visuallyHiddenText: component.title,
              href: returnPath,
            },
          ],
        },
      };
    };
  }
}
