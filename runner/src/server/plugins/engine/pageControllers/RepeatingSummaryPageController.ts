import { PageController } from "server/plugins/engine/pageControllers/PageController";
import {
  HapiRequest,
  HapiResponseToolkit,
  HapiLifecycleMethod,
} from "server/types";
import { RepeatingFieldPageController } from "./RepeatingFieldPageController";
export class RepeatingSummaryPageController extends PageController {
  private getRoute!: HapiLifecycleMethod;
  private postRoute!: HapiLifecycleMethod;
  nextIndex!: RepeatingFieldPageController["nextIndex"];
  getPartialState!: RepeatingFieldPageController["getPartialState"];
  options!: RepeatingFieldPageController["options"];
  removeAtIndex!: RepeatingFieldPageController["removeAtIndex"];
  hideRowTitles!: RepeatingFieldPageController["hideRowTitles"];

  inputComponent;

  constructor(model, pageDef, inputComponent) {
    super(model, pageDef);
    this.inputComponent = inputComponent;
  }

  get getRouteHandler() {
    this.getRoute ??= this.makeGetRouteHandler();
    return this.getRoute;
  }

  get postRouteHandler() {
    this.postRoute ??= this.makePostRouteHandler();
    return this.postRoute;
  }

  /**
   * The controller which is used when Page["controller"] is defined as "./pages/summary.js"
   */

  /**
   * Returns an async function. This is called in plugin.ts when there is a GET request at `/{id}/{path*}`,
   */
  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);

      const { removeAtIndex } = request.query;
      if (removeAtIndex ?? false) {
        return this.removeAtIndex(request, h);
      }

      const state = await cacheService.getState(request);
      const { progress = [] } = state;
      progress?.push(`/${this.model.basePath}${this.path}?view=summary`);
      await cacheService.mergeState(request, { progress });

      const viewModel = this.getViewModel(state);

      return h.view("repeating-summary", viewModel);
    };
  }

  entryToViewModelRow = ([key, value], iteration) => {
    const componentDef = this.pageDef.components.filter(
      (component) => component.name === key
    );

    const { title } = componentDef;
    const titleWithIteration = `${title} ${iteration + 1}`;
    return {
      key: {
        text: titleWithIteration,
      },
      value: {
        text: value,
      },
      actions: {
        items: [
          {
            href: `?view=${iteration}`,
            text: "change",
            visuallyHiddenText: titleWithIteration,
          },
        ],
      },
    };
  };

  getViewModel(formData) {
    const baseViewModel = super.getViewModel(formData);
    const answers = this.getPartialState(formData);
    const rows = this.getRowsFromAnswers(answers, "summary");

    return {
      ...baseViewModel,
      customText: this.options.customText,
      details: { rows },
    };
  }

  getRowsFromAnswers(answers, view = false) {
    const { title = "" } = this.inputComponent;
    const listValueToText = this.inputComponent.list?.items?.reduce(
      (prev, curr) => ({ ...prev, [curr.value]: curr.text }),
      {}
    );

    return answers?.map((value, i) => {
      const titleWithIteration = `${title} ${i + 1}`;
      return {
        key: {
          text: titleWithIteration,
          classes: `${
            this.hideRowTitles ? "govuk-summary-list__row--hidden-titles" : ""
          }`,
        },
        value: {
          text: listValueToText?.[value] ?? value,
          classes: `${
            this.hideRowTitles ? "govuk-summary-list__key--hidden-titles" : ""
          }`,
        },
        actions: {
          items: [
            {
              href: `?removeAtIndex=${i}${view ? `&view=${view}` : ``}`,
              text: "Remove",
              visuallyHiddenText: titleWithIteration,
            },
          ],
        },
      };
    });
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const state = await cacheService.getState(request);

      if (request.payload?.next === "increment") {
        const nextIndex = this.nextIndex(state);
        return h.redirect(
          `/${this.model.basePath}${this.path}?view=${nextIndex}`
        );
      }

      return h.redirect(this.getNext(request.payload));
    };
  }
}
