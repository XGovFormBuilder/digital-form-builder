import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
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
import { Schema } from "joi";
import { DataType } from "./types";

export class MonthYearField extends FormComponent {
  children: ComponentCollection;
  dataType = "monthYear" as DataType;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    const options: any = this.options;

    this.children = new ComponentCollection(
      [
        {
          type: "NumberField",
          name: `${this.name}__month`,
          title: "Month",
          schema: { min: 1, max: 12 },
          options: {
            required: options.required,
            classes: "govuk-input--width-2",
            customValidationMessage: "{{label}} must be between 1 and 12",
          },
        },
        {
          type: "NumberField",
          name: `${this.name}__year`,
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
  }

  getFormSchemaKeys() {
    return this.children.getFormSchemaKeys();
  }

  getStateSchemaKeys() {
    return {
      [this.name]: this.children.getStateSchemaKeys() as Schema,
    };
  }

  getFormDataFromState(state: FormSubmissionState) {
    return this.children.getFormDataFromState(state);
  }

  getStateValueFromValidForm(payload: FormPayload) {
    return this.children.getStateFromValidForm(payload);
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const values = state[this.name];
    const year = values?.[`${this.name}__year`] ?? "Not supplied";

    let monthString = "Not supplied";
    const monthValue = values?.[`${this.name}__month`];
    if (monthValue) {
      const date = new Date();
      date.setMonth(monthValue - 1);
      monthString = date.toLocaleString("default", { month: "long" });
    }

    return `${monthString} ${year}`;
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

    let fieldset = {};

    if (!this.options.isMultiInput) {
      fieldset = {
        legend: viewModel.label,
      };
    }

    return {
      ...viewModel,
      fieldset: fieldset,
      items: componentViewModels,
    };
  }
}
