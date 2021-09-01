import moment from "moment";
import { Schema } from "joi";

import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { optionalText } from "./constants";
import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";

export class DateTimePartsField extends FormComponent {
  children: ComponentCollection;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    const { name } = this;
    const options: any = this.options;

    this.children = new ComponentCollection(
      [
        {
          type: "NumberField",
          name: `${name}__month`,
          title: "Month",
          schema: { min: 1, max: 12 },
          options: {
            required: options.required,
            classes: "govuk-input--width-2",
          },
        },
        {
          type: "NumberField",
          name: `${name}__year`,
          title: "Year",
          schema: { min: 1000, max: 3000 },
          options: {
            required: options.required,
            classes: "govuk-input--width-4",
          },
        },
      ] as any,
      model
    );

    this.stateSchema = helpers.buildStateSchema("date", this);
  }

  getFormSchemaKeys() {
    return this.children.getFormSchemaKeys();
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const value =
      typeof state[name] === "string" ? new Date(state[name]) : state[name];
    return {
      [`${name}__month`]: value && value.getMonth() + 1,
      [`${name}__year`]: value && value.getFullYear(),
    };
  }

  getStateValueFromValidForm(payload: FormPayload) {
    const name = this.name;

    return [payload[`${name}__month`] - 1, payload[`${name}__year`]];
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    return `${state[`${name}__month`] - 1} ${state[`${name}__year`]}`;
  }

  // @ts-ignore - eslint does not report this as an error, only tsc
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    // Use the component collection to generate the subitems
    const componentViewModels = this.children
      .getViewModel(formData, errors)
      .map((vm) => vm.model);

    componentViewModels.forEach((componentViewModel) => {
      // Nunjucks macro expects label to be a string for this component
      componentViewModel.label = componentViewModel.label?.text?.replace(
        optionalText,
        ""
      ) as any;

      if (componentViewModel.errorMessage) {
        componentViewModel.classes += " govuk-input--error";
      }
    });

    return {
      ...viewModel,
      fieldset: {
        legend: viewModel.label,
      },
      items: componentViewModels,
    };
  }
}
