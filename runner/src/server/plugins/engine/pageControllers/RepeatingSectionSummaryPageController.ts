import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { FormComponent } from "../components";
import { summaryDetailsTransformationMap } from "../models/SummaryViewModel.detailsTransformationMap";
import {
  HapiRequest,
  HapiResponseToolkit,
  HapiLifecycleMethod,
} from "server/types";
import { RepeatingFieldPage } from "@xgovformbuilder/model";
import { clone, reach } from "hoek";

export class RepeatingSectionSummaryPageController extends PageController {
  private getRoute!: HapiLifecycleMethod;
  private postRoute!: HapiLifecycleMethod;
  inputComponent: FormComponent;

  constructor(model: FormModel, pageDef: RepeatingFieldPage) {
    super(model, pageDef);
    const inputComponent = this.components?.items[0];
    if (!inputComponent) {
      throw Error(
        "RepeatingSectionSummaryPageController initialisation failed, no input component was found"
      );
    }
    this.inputComponent = inputComponent as FormComponent;
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
      const state = await cacheService.getState(request);

      const { removeAtIndex } = request.query;
      if (removeAtIndex ?? false) {
        return this.removeAtIndex(request, h);
      }

      const viewModel = this.getViewModel(state, request.query.error);
      return h.view("repeating-section-summary", viewModel);
    };
  }

  getViewModel(formData, error) {
    const baseViewModel = super.getViewModel(formData);
    const path = ["", this.inputComponent.name].filter(Boolean).join(".");
    const answers = reach(formData, path)?.repeatingSections;
    const cards = Array.isArray(answers) && this.getCardsFromAnswers(answers);
    const errorMsg = "Select 'yes' to add another";

    return {
      ...baseViewModel,
      details: cards,
      errors: error && {
        titleText: "There is a problem",
        errorList: [
          { path: "next", href: "#next", name: "next", text: errorMsg },
        ],
      },
    };
  }

  getCardsFromAnswers(answers) {
    const { title = "", name = "" } = this.inputComponent;

    const summaryDetails = answers?.map((section, i) => {
      return {
        name: `${name}${i + 1}`,
        title: `${title} ${i + 1}`,
        items: section,
      };
    });
    let transformedDetails = summaryDetails;
    const transformDetails =
      summaryDetailsTransformationMap[this.model.basePath];
    if (transformDetails) {
      try {
        transformedDetails = transformDetails(clone(summaryDetails));
      } catch (err) {}
    }

    return transformedDetails.map((section) => {
      return {
        name: section.name,
        title: section.title,
        rows: section.items.map((item) => {
          return {
            key: { text: item.label },
            value: { text: item.value },
            actions: {},
          };
        }),
      };
    });
  }

  async removeAtIndex(request, h) {
    const { query } = request;
    const { removeAtIndex } = query;
    const { cacheService } = request.services([]);
    let state = await cacheService.getState(request);
    const key = this.inputComponent.name;
    const answers = state[key]?.repeatingSections;
    answers?.splice(removeAtIndex, 1);
    await cacheService.mergeState(request, {
      [key]: { repeatingSections: answers },
    });
    return h.redirect("?removed=true");
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      if (!request.payload?.next) {
        return h.redirect("?error=true");
      } else if (request.payload?.next === "increment") {
        const newObj = {};
        const sliceEnd = 0 - "Container".length;
        const sectionToEmpty = this.inputComponent.name.slice(0, sliceEnd);
        newObj[sectionToEmpty] = null;
        const { cacheService } = request.services([]);

        await cacheService.mergeState(request, newObj);
        const state = await cacheService.getState(request);
        const progress = state.progress || [];
        return h.redirect(progress[progress.length - 1]);
      }

      return h.redirect(this.getNext(request.payload));
    };
  }
}
