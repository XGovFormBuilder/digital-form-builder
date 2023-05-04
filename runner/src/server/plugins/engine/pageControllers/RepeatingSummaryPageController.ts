import { PageController } from "server/plugins/engine/pageControllers/PageController";
import {
  HapiRequest,
  HapiResponseToolkit,
  HapiLifecycleMethod,
} from "server/types";
import { RepeatingFieldPageController } from "./RepeatingFieldPageController";
import { parseISO, format } from "date-fns";
import config from "server/config";
import { SaveViewModel } from "../models";
export class RepeatingSummaryPageController extends PageController {
  private getRoute!: HapiLifecycleMethod;
  private postRoute!: HapiLifecycleMethod;
  nextIndex!: RepeatingFieldPageController["nextIndex"];
  getPartialState!: RepeatingFieldPageController["getPartialState"];
  options!: RepeatingFieldPageController["options"];
  removeAtIndex!: RepeatingFieldPageController["removeAtIndex"];
  hideRowTitles!: RepeatingFieldPageController["hideRowTitles"];

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

      const { removeAtIndex } = request.query;
      if (removeAtIndex ?? false) {
        return this.removeAtIndex(request, h);
      }

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
    const answers = this.getPartialState(formData);
    if (this.inputComponent.type === "MultiInputField") {
      rows = this.buildTextFieldRows(answers, this.inputComponent);
      return {
        ...baseViewModel,
        customText: this.options.customText,
        details: { rows, headings: this.inputComponent.options.columnTitles },
      };
    }

    rows = this.getRowsFromAnswers(answers, "summary");
    return {
      ...baseViewModel,
      customText: this.options.customText,
      details: { rows },
    };
  }

  buildRows(state, response) {
    let form_session_identifier = "";
    if (response.request.query.form_session_identifier) {
      form_session_identifier = `&form_session_identifier=${response.request.query.form_session_identifier}`;
    }

    if (this.inputComponent.type === "MultiInputField") {
      return this.buildTextFieldRows(state, form_session_identifier);
    }
    return this.getRowsFromAnswers(state, form_session_identifier);
  }

  getRowsFromAnswers(answers, form_session_identifier, view = false) {
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
              href: `?removeAtIndex=${i}${
                view ? `&view=${view}` : ``
              }${form_session_identifier}`,
              text: "Remove",
              visuallyHiddenText: titleWithIteration,
            },
          ],
        },
      };
    });
  }

  isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  buildTextFieldRows(answers, form_session_identifier, view = false) {
    const { title = "" } = this.inputComponent;
    return answers?.map((value, i) => {
      const valueValues: string[] = [];
      for (const key in value) {
        if (this.inputComponent.getComponentType(key) == "DatePartsField") {
          valueValues.push(format(parseISO(value[key]), "d MMMM yyyy"));
        } else {
          valueValues.push(
            `${this.inputComponent.getPrefix(key)}${value[key]}`
          );
        }
      }

      const row = {
        action: {
          href: `?removeAtIndex=${i}${
            view ? `&view=${view}` : ``
          }${form_session_identifier}`,
          text: "Remove",
          visuallyHiddenText: title,
        },
        values: [],
      };

      for (let i = 0; i < valueValues.length; i++) {
        row.values.push({
          text: valueValues[i],
          class: i == 0 ? "govuk-table__header" : "govuk-table__cell",
        } as never);
      }
      return row;
    });
  }

  /**
   * Returns an async function. This is called in plugin.ts when there is a POST request at `/{id}/{path*}`.
   * If a form is incomplete, a user will be redirected to the start page.
   */
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService, statusService } = request.services([]);
      const state = await cacheService.getState(request);

      if (request.payload?.next === "increment") {
        const nextIndex = this.nextIndex(state);
        let returnUrl =
          this.returnUrl !== undefined ? `&returnUrl=${this.returnUrl}` : "";
        return h.redirect(
          `/${this.model.basePath}${this.path}?view=${nextIndex}${returnUrl}`
        );
      }

      if (config.savePerPage) {
        const savedState = await cacheService.getState(request);

        let relevantState = this.getConditionEvaluationContext(
          this.model,
          savedState
        );

        const saveViewModel = new SaveViewModel(
          this.title,
          this.model,
          relevantState,
          request
        );

        await cacheService.mergeState(request, {
          outputs: saveViewModel.outputs,
          userCompletedSummary: true,
          webhookData: saveViewModel.validatedWebhookData,
        });

        await statusService.savePerPageRequest(request);
      }

      if (typeof this.returnUrl !== "undefined") {
        return h.redirect(this.returnUrl);
      }

      return h.redirect(this.getNext(request.payload));
    };
  }
}
