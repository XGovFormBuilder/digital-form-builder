import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PageController } from "./PageController";
import { FormModel } from "server/plugins/engine/models";
import { RepeatingSummaryPageController } from "./RepeatingSummaryPageController";
import { ComponentDef } from "@xgovformbuilder/model";
import { FormComponent } from "../components";

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

export class RepeatingFieldPageController extends PageController {
  summary: RepeatingSummaryPageController;
  inputComponent: FormComponent;
  isRepeatingFieldPageController = true;
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    const inputComponent = this.components?.items?.find(isInputType);
    if (!inputComponent) {
      throw Error(
        "RepeatingFieldPageController initialisation failed, no input component (non-content) was found"
      );
    }
    this.inputComponent = inputComponent as FormComponent;

    this.summary = new RepeatingSummaryPageController(
      model,
      pageDef,
      this.inputComponent
    );
    this.summary.getPartialState = this.getPartialState;
    this.summary.nextIndex = this.nextIndex;
  }

  get stateSchema() {
    const name = this.inputComponent.name;
    const parentSchema = super.stateSchema.fork([name], (schema) => {
      if (schema.type !== "array") {
        return joi.array().items(schema).single().empty(null).default([]);
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

      if (view === "summary" || returnUrl) {
        return this.summary.getRouteHandler(request, h);
      }
      if (view ?? false) {
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

      return super.makeGetRouteHandler()(request, h);
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;

      if (query.view === "summary") {
        return this.summary.postRouteHandler(request, h);
      }

      const modifyUpdate = (update) => {
        const key = this.inputComponent.name;
        const value = update[key];
        const wrappedValue = !Array.isArray(value) ? [value] : value;
        return {
          [key]: [...new Set(wrappedValue)],
        };
      };

      const response = await this.handlePostRequest(request, h, {
        arrayMerge: true,
        modifyUpdate,
      });

      if (response?.source?.context?.errors) {
        return response;
      }

      return h.redirect(`/${this.model.basePath}${this.path}?view=summary`);
    };
  }

  getPartialState(state, atIndex?: number) {
    const keyName = this.inputComponent.name;
    const sectionName = this.pageDef.sectionName ?? "";
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
}
