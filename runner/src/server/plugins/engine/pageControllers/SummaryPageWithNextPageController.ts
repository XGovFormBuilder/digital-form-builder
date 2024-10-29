import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "server/plugins/engine/pageControllers/PageController";

import { FormComponent } from "server/plugins/engine/components";
import { PageControllerBase } from "server/plugins/engine/pageControllers/PageControllerBase";
import { FormModel } from "server/plugins/engine/models";

export class SummaryPageWithNextPageController extends PageController {
  returnUrlParameter: string;
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    /**
     * TODO: set options to the instance if necessary.
     */

    const returnPath = `/${this.model.basePath}${this.path}`;
    this.returnUrlParameter = `?returnUrl=${encodeURIComponent(returnPath)}`;
  }
  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
   */
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      this.langFromRequest(request);

      const viewModel = await this.summaryViewModel(request);
      return h.view("summary-with-next", viewModel);
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
    const { relevantPages } = this.model.getRelevantPages(state);

    const rowsBySection = relevantPages.reduce((prev, page) => {
      const sectionName = page.section?.name;
      const section = prev[sectionName] ?? [];
      let sectionState = section ? state[sectionName] || {} : state;

      const toRow = this.formItemsToRowByPage({
        page,
        sectionState,
        returnUrlParameter: this.returnUrlParameter,
      });

      section.push(...page.components.formItems.map(toRow));

      prev[sectionName] = section;
      return prev;
    }, {});

    const lists = Object.entries(rowsBySection).map(([section, rows]) => {
      const modelSection = this.model.sections.find(
        (mSection) => mSection.name === section
      );

      return {
        sectionTitle: !modelSection?.hideTitle ? modelSection?.title : "",
        section,
        rows,
      };
    });

    return {
      pageTitle: this.title,
      name: this.model.name,
      phaseTag: this.model.name,
      lists,
    };
  }

  formItemsToRowByPage({
    page,
    sectionState,
    returnUrlParameter,
  }: {
    page: PageControllerBase;
    sectionState: { [key: string]: any };
    returnUrlParameter: string;
  }) {
    return function (component: FormComponent) {
      const pagePath = `/${page.model.basePath}${page.path}`;
      const valueText = component.getDisplayStringFromState(sectionState);

      return {
        key: {
          text: component.title,
        },
        value: {
          text: valueText ?? "Not supplied",
        },
        actions: {
          items: [
            {
              text: "Change",
              visuallyHiddenText: component.title,
              href: `${pagePath}${returnUrlParameter}`,
            },
          ],
        },
      };
    };
  }
}
