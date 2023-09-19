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
import { UkAddressField } from "../components";
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
      viewModel.crumb = request.plugins.crumb;

      viewModel.backLink =
        state.callback?.returnUrl ?? progress[progress.length - 2];
      viewModel.backLinkText =
        this.model.def?.backLinkText ?? "Go back to application overview";

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
      const orderedNames = this.inputComponent.children.items.map(
        (x) => x.name
      );
      rows = this.buildTextFieldRows(
        answers,
        formData.metadata.form_session_identifier,
        orderedNames
      );
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
    let form_session_identifier =
      response.request.query.form_session_identifier ?? "";

    if (this.inputComponent.type === "MultiInputField") {
      const orderedNames = this.inputComponent.children.items.map(
        (x) => x.name
      );
      return this.buildTextFieldRows(
        state,
        form_session_identifier,
        orderedNames
      );
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
              text: this.options.customText?.removeText ?? "Remove",
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

  _renderComponentByType(key, value) {
    const componentType = this.inputComponent.getComponentType(key);

    if (componentType == "DatePartsField") {
      return format(parseISO(value), "d/MM/yyyy");
    } else if (componentType == "MonthYearField") {
      return value[`${key}__month`] + "/" + value[`${key}__year`];
    } else if (componentType == "YesNoField") {
      return value ? "Yes" : "No";
    } else if (componentType == "UkAddressField") {
      return value
        ? [
            value.addressLine1,
            value.addressLine2,
            value.town,
            value.county,
            value.postcode,
          ]
            .filter((p) => {
              return !!p;
            })
            .join(", ")
        : "";
    }

    return `${this.inputComponent.getPrefix(key)}${value}`;
  }

  buildTextFieldRows(
    answers,
    form_session_identifier,
    orderedNames,
    view = false
  ) {
    const { title = "" } = this.inputComponent;

    if (form_session_identifier) {
      form_session_identifier = `&form_session_identifier=${form_session_identifier}`;
    }

    return answers?.map((answer, i) => {
      const keyToRenderedValue = {};
      for (const [key, value] of Object.entries(answer)) {
        const renderedValue = this._renderComponentByType(key, value);
        keyToRenderedValue[key] = renderedValue;
      }

      const row = {
        action: {
          href: `?removeAtIndex=${i}${view ? `&view=${view}` : ``}${
            form_session_identifier ? form_session_identifier : ``
          }`,
          text: this.options.customText?.removeText ?? "Remove",
          visuallyHiddenText: title,
        },
        values: [],
      };

      for (const [i, name] of orderedNames.entries()) {
        row.values.push({
          text: keyToRenderedValue[name],
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
      const query = request.query;
      let form_session_identifier = "";

      if (query.form_session_identifier) {
        form_session_identifier = `form_session_identifier=${query.form_session_identifier}`;
      }

      if (request.payload?.next === "increment") {
        const nextIndex = this.nextIndex(state);
        let returnUrl =
          this.returnUrl !== undefined ? `&returnUrl=${this.returnUrl}` : "";
        return h.redirect(
          `/${this.model.basePath}${this.path}?view=${nextIndex}${returnUrl}&${form_session_identifier}`
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
        return h.redirect(this.returnUrl + `?${form_session_identifier}`);
      }

      return h.redirect(this.getNext(state) + `?${form_session_identifier}`);
    };
  }
}
