import { Schema } from "joi";
import { FieldsetComponent } from "@xgovformbuilder/model";
import Joi from "joi";

import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";
import { ListItem } from "./types";

export class Fieldset extends FormComponent {
  children: ComponentCollection;
  formSchema: Joi.Schema;
  stateSchema: Joi.Schema;

  constructor(def: FieldsetComponent, model: FormModel) {
    super(def, model);

    const { components, options } = def;
    const validation = options?.validation;
    const childDefs = validation
      ? [
          ...components,
          // Hidden carrier field for validation to attach
          // to as Joi only runs validators on keys present in the
          // payload. Removing this field disables validation
          {
            type: "TextField" as const,
            name: this.name,
            title: this.title,
            schema: {},
            options: {
              classes: "govuk-!-display-none",
              hideTitle: true,
              disableChangingFromSummary: true,
              allowPrePopulationOverwrite: true,
              required: false,
            },
          },
        ]
      : components;

    this.children = new ComponentCollection(childDefs as any, model);

    // Form schema for payload
    let schema = Joi.any();

    if (validation) {
      for (const val of validation) {
        // Cross-field rule enforcing "at least minRrequired" is filled in
        // Injected as callback on the synthetic [this.name] key in getFormSchemaKeys
        if (val.minRequired && val.minRequired > 0) {
          schema = schema
            .custom((value, helpers) => {
              const root = helpers.state.ancestors[0] as any;
              const filledCount = val.fields.filter((n) => {
                const v = root?.[n];
                return v !== undefined && v !== null && String(v).trim() !== "";
              }).length;

              if (filledCount < val.minRequired) {
                return helpers.error("any.invalid");
              }

              return value ?? "";
            })
            .messages({
              "any.invalid":
                val.errorMessage ??
                `Enter at least ${val.minRequired} of: ${val.fields.join(
                  ", "
                )}`,
            });
        }
      }
    } else {
      schema = Joi.any().optional();
    }

    this.formSchema = schema;

    // State schema - allow empty for fieldset name
    this.stateSchema = Joi.any().allow("", null).optional();
  }

  getFormSchemaKeys() {
    const childrenKeys = this.children.getFormSchemaKeys();

    return {
      ...childrenKeys,
      [this.name]: this.formSchema,
    };
  }

  getStateSchemaKeys() {
    const childrenKeys = this.children.getStateSchemaKeys();
    return {
      ...childrenKeys,
      [this.name]: this.stateSchema,
    };
  }

  getFormDataFromState(state: FormSubmissionState) {
    let childState: FormSubmissionState = {};
    if (this.name in state) {
      childState = { ...state[this.name] };
    } else {
      return undefined;
    }

    const childData = this.children.getFormDataFromState(childState);

    return {
      [this.name]: childData,
    };
  }

  getStateValueFromValidForm(payload: FormPayload) {
    const childData = this.children.getStateFromValidForm(payload);
    delete childData[this.name]; // Remove the synthetic field used for validation
    for (const key in childData) {
      if (childData[key] === undefined || childData[key] === null) {
        childData[key] = "";
      }
    }

    return childData;
  }

  getStateFromValidForm(payload: FormPayload) {
    return {
      [this.name]: this.getStateValueFromValidForm(payload),
    };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    let childState: FormSubmissionState = {};
    if (this.name in state) {
      childState = { ...state[this.name] };
    }

    return this.children.formItems
      .map((item) => item.getDisplayStringFromState(childState))
      .filter((str) => str && str.trim() !== "")
      .join(", ");
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const childErrors: FormSubmissionErrors | undefined = errors
      ? {
          ...errors,
          errorList:
            errors.errorList?.filter((e) => e.name !== this.name) ?? [],
        }
      : errors;

    // When formData comes from state (e.g. a GET render), children's values
    // are nested under this.name - as produced by getFormDataFromState - so
    // lift them back to the top level the children expect. When formData is
    // a raw submitted payload (e.g. re-rendering after a validation error),
    // this.name is either absent or a flat string (the synthetic validation
    // carrier field), so it's left untouched.
    const nestedState = (formData as any)[this.name];
    const childFormData =
      nestedState && typeof nestedState === "object"
        ? { ...formData, ...nestedState }
        : formData;

    const componentViewModels = this.children
      .getViewModel(childFormData, childErrors)
      .map((vm) => vm.model);

    componentViewModels.forEach((viewModel: any) => {
      if (viewModel.errorMessage) {
        viewModel.classes = `${
          viewModel.classes ?? ""
        } govuk-input--error`.trim();
      }
    });

    return {
      ...viewModel,
      fieldset: { legend: viewModel.label },
      items: componentViewModels as unknown as ListItem[],
    };
  }
}
