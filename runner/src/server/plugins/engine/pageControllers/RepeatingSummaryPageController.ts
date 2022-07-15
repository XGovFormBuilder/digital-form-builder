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

  inputComponent;
  returnUrl;

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
      const state = await cacheService.getState(request);
      const { progress = [] } = state;
      const { query } = request;
      const { returnUrl } = query;
      this.returnUrl = returnUrl;

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
    let rows;
    if (this.inputComponent.length === 1) {
      rows = this.buildListRows(formData);
    } else {
      rows = this.buildTextFieldRows(formData);
    }
    return {
      ...baseViewModel,
      details: { rows },
    };
  }

  buildListRows(formData) {
    const answers = this.getPartialState(formData);
    const { title = "" } = this.inputComponent[0];
    const listValueToText = this.inputComponent[0].list?.items?.reduce(
      (prev, curr) => ({ ...prev, [curr.value]: curr.text }),
      {}
    );

    const rows = answers?.map((value, i) => {
      const titleWithIteration = `${title} ${i + 1}`;
      return {
        key: {
          text: titleWithIteration,
        },
        value: {
          text: listValueToText?.[value] ?? value,
        },
        actions: {
          items: [
            {
              href: `?removeAtIndex=${i}`,
              text: "Remove",
              visuallyHiddenText: titleWithIteration,
            },
          ],
        },
      };
    });
    return rows;
  }

  buildTextFieldRows(formData) {
    delete formData["progress"];
    const rows = Object.keys(formData.MultlInputText).map((key) => {
      const titleWithIteration = `${formData.MultlInputText[key].title}`;
      return {
        key: {
          text: titleWithIteration,
        },
        value: {
          text: formData.MultlInputText[key].value,
        },
        actions: {
          items: [
            {
              href: `?removeAtIndex=${key}`,
              text: "Remove",
              visuallyHiddenText: titleWithIteration,
            },
          ],
        },
      };
    });
    return rows;
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

      if (typeof this.returnUrl !== "undefined") {
        return h.redirect(this.returnUrl);
      }

      return h.redirect(this.getNext(request.payload));
    };
  }
}
