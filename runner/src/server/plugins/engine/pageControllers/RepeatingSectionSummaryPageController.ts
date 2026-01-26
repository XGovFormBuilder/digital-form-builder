import { PageController } from "server/plugins/engine/pageControllers/PageController";
import {
  HapiRequest,
  HapiResponseToolkit,
  HapiLifecycleMethod,
} from "server/types";
import { RepeatingFieldPageController } from "./RepeatingFieldPageController";
export class RepeatingSectionSummaryPageController extends PageController {
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

      return h.view("repeating-section-summary", viewModel);
    };
  }

  getViewModel(formData) {
    const baseViewModel = super.getViewModel(formData);
    const answers = this.getPartialState(formData);
    const cards = Array.isArray(answers) && this.getCardsFromAnswers(answers);

    return {
      ...baseViewModel,
      customText: this.options.customText,
      details: cards,
    };
  }

  getCardsFromAnswers(answers) {
    const { title = "" } = this.inputComponent;

    return answers?.map((value, i) => {
      return {
        title: `${title} ${i + 1}`,
        rows: Object.keys(value).map((key) => {
          return {
            key: { text: key },
            value: { text: value[key] },
            actions: {}
          }
        })
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
        return h.redirect(
          `/${this.model.basePath}/start`
        );
      }

      return h.redirect(this.getNext(request.payload));
    };
  }
}
