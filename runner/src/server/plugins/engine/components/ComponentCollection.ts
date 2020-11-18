import joi, { Schema as JoiSchema } from "joi";
import { Component, StaticValue } from "@xgovformbuilder/model";

import * as Components from "./index";
import { FormModel } from "../formModel";
import { FormSubmissionState } from "../types";
import { ComponentCollectionViewModel } from "./types";
import { ComponentBase } from "./ComponentBase";

export class ComponentCollection {
  items: Array<StaticValue> | undefined;
  formSchema: JoiSchema;
  stateSchema: JoiSchema;

  formItems: any; // TODO

  constructor(items: Component[], model: FormModel) {
    const itemTypes = items.map((def) => {
      const Type = Components[def.type];

      if (typeof Type !== "function") {
        throw new Error(`Component type ${def.type} doesn't exist`);
      }

      return new Type(def, model);
    });

    const formItems = itemTypes.filter(
      (component) => component.isFormComponent
    );

    this.items = itemTypes;
    this.formItems = formItems;
    this.formSchema = joi
      .object()
      .keys(this.getFormSchemaKeys())
      .required()
      .keys({ crumb: joi.string().optional().allow("") });

    this.stateSchema = joi.object().keys(this.getStateSchemaKeys()).required();
  }

  getFormSchemaKeys() {
    const keys = {};

    this.formItems.forEach((item) => {
      Object.assign(keys, item.getFormSchemaKeys());
    });

    return keys;
  }

  getStateSchemaKeys() {
    const keys = {};

    this.formItems.forEach((item) => {
      Object.assign(keys, item.getStateSchemaKeys());
    });

    return keys;
  }

  getFormDataFromState(state: FormSubmissionState): any {
    const formData = {};

    this.formItems.forEach((item) => {
      Object.assign(formData, item.getFormDataFromState(state));
    });

    return formData;
  }

  getStateFromValidForm(payload) {
    const state = {};

    this.formItems.forEach((item) => {
      Object.assign(state, item.getStateFromValidForm(payload));
    });

    return state;
  }

  getViewModel(formData, errors): ComponentCollectionViewModel {
    return this.items.map((item) => {
      return {
        type: item.type,
        isFormComponent: item.isFormComponent,
        model: item.getViewModel(formData, errors),
      };
    });
  }
}
