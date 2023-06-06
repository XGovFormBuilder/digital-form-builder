import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "./PageController";
import { FormModel } from "server/plugins/engine/models";
import { RepeatingSummaryPageController } from "./RepeatingSummaryPageController";
import { ComponentDef, RepeatingFieldPage } from "@xgovformbuilder/model";
import { FormComponent } from "../components";
import config from "server/config";
import { SaveViewModel } from "../models";

import joi from "joi";
import { reach } from "hoek";

const contentTypes: Array<ComponentDef["type"]> = [
  "Para",
  "Details",
  "Html",
  "InsetText",
];

function isInputType(component) {
  return !contentTypes.includes(component.type);
}

const DEFAULT_OPTIONS = {
  summaryDisplayMode: {
    samePage: false,
    separatePage: true,
    hideRowTitles: false,
  },
  customText: {
    columnOneTitle: "Description",
    columnTwoTitle: "Amount",
    columnThreeTitle: "Action",
  },
};

/**
 * TODO:- this will be refactored as per https://github.com/XGovFormBuilder/digital-form-builder/discussions/855
 */
export class RepeatingFieldPageController extends PageController {
  summary: RepeatingSummaryPageController;
  inputComponent: FormComponent;
  isRepeatingFieldPageController = true;
  isSamePageDisplayMode: boolean;
  isSeparateDisplayMode: boolean;
  hideRowTitles: boolean;
  noCostsTitle: string;
  noCostsText: string;
  saveText: string;

  options: RepeatingFieldPage["options"];

  constructor(model: FormModel, pageDef: RepeatingFieldPage) {
    super(model, pageDef);
    const inputComponent = this.components?.items?.find(isInputType);
    if (!inputComponent) {
      throw Error(
        "RepeatingFieldPageController initialisation failed, no input component (non-content) was found"
      );
    }

    this.options = pageDef?.options ?? DEFAULT_OPTIONS;
    this.options.summaryDisplayMode ??= DEFAULT_OPTIONS.summaryDisplayMode;
    this.options.hideRowTitles ??= DEFAULT_OPTIONS.hideRowTitles;
    this.options.customText ??= DEFAULT_OPTIONS.customText;
    this.options.customText.columnOneTitle ??=
      DEFAULT_OPTIONS.customText.columnOneTitle;
    this.options.customText.columnTwoTitle ??=
      DEFAULT_OPTIONS.customText.columnTwoTitle;
    this.options.customText.columnThreeTitle ??=
      DEFAULT_OPTIONS.customText.columnThreeTitle;

    this.isSamePageDisplayMode = this.options.summaryDisplayMode.samePage!;
    this.isSeparateDisplayMode = this.options.summaryDisplayMode.separatePage!;
    this.hideRowTitles = this.options.summaryDisplayMode.hideRowTitles!;

    this.inputComponent = inputComponent as FormComponent;

    this.summary = new RepeatingSummaryPageController(
      model,
      pageDef,
      this.inputComponent
    );
    this.summary.getPartialState = this.getPartialState;
    this.summary.nextIndex = this.nextIndex;
    this.summary.removeAtIndex = this.removeAtIndex;
    this.summary.hideRowTitles = this.hideRowTitles;

    this.summary.options = this.options;

    this.noCostsTitle = "You have not added any costs yet";
    this.noCostsText = "Each cost you add will be shown here";
    this.saveText = "Save and add another";
    if (model?.def?.metadata?.isWelsh) {
      this.noCostsTitle = "Nid ydych chi wedi ychwanegu unrhyw gostau eto";
      this.noCostsText = "Bydd pob cost yr ychwanegwch yn cael ei dangos yma";
      this.saveText = "Cadw ac ychwanegu un arall";
    }
  }

  get stateSchema() {
    const name = this.inputComponent.name;
    const parentSchema = super.stateSchema.fork([name], (schema) => {
      if (schema.type !== "array") {
        schema = joi.array().items(schema).single().empty(null).default([]);
      }

      if (this.inputComponent.options.required) {
        schema = schema.required();
      }

      return schema;
    });

    super.stateSchema = parentSchema;
    return parentSchema;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;
      const { removeAtIndex, view, returnUrl } = query;
      const { cacheService } = request.services([]);
      let form_session_identifier = "";

      if (query.form_session_identifier) {
        form_session_identifier = `form_session_identifier=${query.form_session_identifier}`;
      }

      let state = await cacheService.getState(request);
      const partialState = this.getPartialState(state, view);
      state[this.inputComponent.name] = this.convertMultiInputStringAnswers(
        state[this.inputComponent.name]
      );
      state = await cacheService.mergeState(request, state);

      if (removeAtIndex ?? false) {
        return this.removeAtIndex(request, h);
      }

      if (view === "summary" && !this.isSamePageDisplayMode) {
        return this.summary.getRouteHandler(request, h);
      }

      if ((view ?? false) || this.isSamePageDisplayMode) {
        const response = await super.makeGetRouteHandler()(request, h);
        const { cacheService } = request.services([]);
        const state = await cacheService.getState(request);
        const partialState = this.getPartialState(state, view);

        response.source.context.components &&= response.source.context.components.map(
          (component) => {
            const { model } = component;
            model.value = partialState;
            model.items &&= model.items.filter(
              (item) => !state[model.name]?.includes(item.value)
            );
            return {
              ...component,
              model,
            };
          }
        );

        this.addRowsToViewContext(response, state);
        return response;
      }

      if (removeAtIndex ?? false) {
        const { cacheService } = request.services([]);
        let state = await cacheService.getState(request);
        const key = this.inputComponent.name;
        const answers = state[key];
        answers?.splice(removeAtIndex, 1);
        state = await cacheService.mergeState(request, { [key]: answers });
        if (state[key]?.length < 1) {
          return h.redirect("?view=0");
        }
        return h.redirect(`?view=summary`);
      }

      if (typeof partialState !== "undefined") {
        return h.redirect(
          `?view=${view ?? "summary&"}${form_session_identifier}`
        );
      }

      return super.makeGetRouteHandler()(request, h);
    };
  }

  addRowsToViewContext(response, state) {
    let rows = {};
    if (this.options!.summaryDisplayMode!.samePage) {
      rows = this.summary.buildRows(this.getPartialState(state), response);
      response.source.context.details = {
        headings: this.inputComponent.options.columnTitles,
        rows,
      };
    }
  }

  async removeAtIndex(request, h) {
    const { query } = request;
    const { removeAtIndex, view } = query;
    const { cacheService } = request.services([]);
    let state = await cacheService.getState(request);
    const key = this.inputComponent.name;
    let answers = state[key];

    const sectionName =
      this.pageDef.section === undefined ? "" : this.pageDef.section;

    let form_session_identifier = "";

    if (query.form_session_identifier) {
      form_session_identifier = `&form_session_identifier=${query.form_session_identifier}`;
    }

    if (sectionName) {
      // Gets the answers from the correct section
      answers = state[sectionName][key];
      answers?.splice(removeAtIndex, 1);
      answers = { [key]: answers };
      await cacheService.mergeState(request, { [sectionName]: answers });

      //TODO: Quick fix but lets see if we can make the returing happen in one place
      if (
        state[sectionName][key] === undefined ||
        state[sectionName][key]?.length < 1 ||
        this.isSamePageDisplayMode
      ) {
        return h.redirect(`?view=0${form_session_identifier}`);
      }
      return h.redirect(`?view=${view ?? "summary"}${form_session_identifier}`);
    } else {
      answers?.splice(removeAtIndex, 1);
      await cacheService.mergeState(request, { [key]: answers });
    }

    if (
      state[key] === undefined ||
      state[key]?.length < 1 ||
      this.isSamePageDisplayMode
    ) {
      return h.redirect(`?view=0${form_session_identifier}`);
    }

    return h.redirect(`?view=${view ?? "summary"}${form_session_identifier}`);
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;
      const { cacheService, statusService } = request.services([]);
      let form_session_identifier = "";

      //TODO quick fix to get sessions working with add another. We should look at a better way of passing through the query
      if (query.form_session_identifier) {
        form_session_identifier = `form_session_identifier=${query.form_session_identifier}`;
      }

      let returnUrl = "";
      if (query.returnUrl) {
        returnUrl = `&returnUrl=${query.returnUrl}`;
      }

      if (query.view === "summary") {
        return this.summary.postRouteHandler(request, h);
      }

      if (request?.payload?.next === "continue") {
        const { next, ...rest } = request.payload;
        if (this.isSeparateDisplayMode) {
          return h.redirect(`?view=summary`);
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

        if (typeof query.returnUrl !== "undefined") {
          return h.redirect(`${query.returnUrl}?${form_session_identifier}`);
        }
        return h.redirect(`${this.getNext(rest)}?${form_session_identifier}`);
      }

      const modifyUpdate = (update) => {
        const key = this.inputComponent.name;
        let value = update[key];
        let wrappedValue = !Array.isArray(value) ? [value] : value;

        if (this.section) {
          wrappedValue = update[this.section.name];
          return {
            [this.section.name]: wrappedValue,
          };
        }

        return {
          [key]: [...new Set(wrappedValue)],
        };
      };

      const response = await this.handlePostRequest(request, h, {
        arrayMerge: true,
        modifyUpdate,
      });

      if (response?.source?.context?.errors) {
        const { cacheService } = request.services([]);
        const state = await cacheService.getState(request);
        this.addRowsToViewContext(response, state);
        return response;
      }

      //TODO when the rework of add another is done we should look at changing this to use the redirect methods in the helpers class
      if (this.options!.summaryDisplayMode!.samePage) {
        return h.redirect(
          `/${this.model.basePath}${this.path}?${form_session_identifier}`
        );
      }
      return h.redirect(
        `/${this.model.basePath}${this.path}?view=summary&${form_session_identifier}${returnUrl}`
      );
    };
  }

  getPartialState(state, atIndex?: number) {
    const keyName = this.inputComponent.name;
    const sectionName =
      this.pageDef.section === undefined ? "" : this.pageDef.section;
    const path = [sectionName, keyName].filter(Boolean).join(".");
    const partial = reach(state, path);
    if (atIndex ?? false) {
      return partial[atIndex!];
    }

    return partial;
  }

  nextIndex(state) {
    const partial = this.getPartialState(state) ?? [];
    return partial.length;
  }

  // This will remain in for a a round for backward compatibility. The string awnsers will convert on a submit
  convertMultiInputStringAnswers(answers) {
    if (typeof answers === "undefined") {
      return answers;
    }

    // The function uses the match method to extract the description and amount from the string using the regular expression.
    // Everything before the : is the description and after : £ is the amount
    const regex = /(.+) : £(.+)$/;
    for (let i = 0; i < answers.length; i++) {
      if (typeof answers[i] === "string") {
        // TODO: We need to have a re-think about how add another answers work
        const amount = answers[i].match(regex)[2];
        const description = answers[i].match(regex)[1];
        answers[i] = {
          "type-of-revenue-cost": description,
          value: amount,
        };
      }
    }
    return answers;
  }
}
