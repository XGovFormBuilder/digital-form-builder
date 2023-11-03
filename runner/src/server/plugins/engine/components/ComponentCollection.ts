import joi, { Schema as JoiSchema } from "joi";
import { ComponentDef } from "@xgovformbuilder/model";

import * as Components from "./index";
import { FormModel } from "../models";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { ComponentCollectionViewModel } from "./types";
import { ComponentBase } from "./ComponentBase";
import { FormComponent } from "./FormComponent";

export class ComponentCollection {
  items: (ComponentBase | ComponentCollection | FormComponent)[];
  formItems: FormComponent /* | ConditionalFormComponent*/[];
  formSchema: JoiSchema;
  stateSchema: JoiSchema;
  additionalValidationFunctions: Function[];

  constructor(componentDefs: ComponentDef[] = [], model: FormModel) {
    const components = componentDefs.map((def) => {
      const Comp: any = Components[def.type];

      if (typeof Comp !== "function") {
        throw new Error(`Component type ${def.type} doesn't exist`);
      }

      return new Comp(def, model);
    });

    const formComponents = components.filter(
      (component) => component.isFormComponent
    );

    this.items = components;
    this.formItems = formComponents;
    this.formSchema = joi
      .object()
      .keys(this.getFormSchemaKeys())
      .required()
      .keys({ crumb: joi.string().optional().allow("") });

    this.stateSchema = joi.object().keys(this.getStateSchemaKeys()).required();
    this.additionalValidationFunctions = this.getAllAdditionalValidationFunctions();
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

  getAllAdditionalValidationFunctions() {
    const funcs = [];
    this.formItems.forEach((item) => {
      const itemFuncs = item.getAdditionalValidationFunctions();
      funcs.push(...itemFuncs);
    });
    return funcs;
  }

  getFormDataFromState(state: FormSubmissionState): any {
    const formData = {};

    this.formItems.forEach((item) => {
      Object.assign(formData, item.getFormDataFromState(state));
    });

    return formData;
  }

  getStateFromValidForm(payload: FormPayload): { [key: string]: any } {
    const state = {};

    this.formItems.forEach((item) => {
      Object.assign(state, item.getStateFromValidForm(payload));
    });

    return state;
  }

  getViewModel(
    formData: FormData | FormSubmissionState,
    errors?: FormSubmissionErrors,
    conditions?: FormModel["conditions"]
  ): ComponentCollectionViewModel {
    const result =
      this.items?.map((item: any) => {
        return {
          type: item.type,
          isFormComponent: item.isFormComponent,
          model: item.getViewModel(formData, errors),
        };
      }) ?? [];

    if (conditions) {
      return result.filter(
        (item) => conditions[item.model?.condition]?.fn(formData) ?? true
      );
    }

    return result;
  }
}
