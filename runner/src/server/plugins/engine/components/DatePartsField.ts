import { add, sub, parseISO, format } from "date-fns";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import { optionalText } from "./constants";
import * as helpers from "./helpers";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";
import { DataType } from "server/plugins/engine/components/types";

export class DatePartsField extends FormComponent {
  children: ComponentCollection;
  dataType = "date" as DataType;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);

    const { name, options } = this;
    const isRequired =
      "required" in options && options.required === false ? false : true;
    const optionalText = "optionalText" in options && options.optionalText;
    this.children = new ComponentCollection(
      [
        {
          type: "NumberField",
          name: `${name}__day`,
          title: "Day",
          schema: { min: 1, max: 31 },
          options: {
            required: isRequired,
            optionalText: optionalText,
            classes: "govuk-input--width-2",
            customValidationMessages: {
              "number.min": "{{#label}} must be between 1 and 31",
              "number.max": "{{#label}} must be between 1 and 31",
              "number.base": `${def.title} must include a day`,
            },
          },
          hint: "",
        },
        {
          type: "NumberField",
          name: `${name}__month`,
          title: "Month",
          schema: { min: 1, max: 12 },
          options: {
            required: isRequired,
            optionalText: optionalText,
            classes: "govuk-input--width-2",
            customValidationMessages: {
              "number.min": "{{#label}} must be between 1 and 12",
              "number.max": "{{#label}} must be between 1 and 12",
              "number.base": `${def.title} must include a month`,
            },
          },
          hint: "",
        },
        {
          type: "NumberField",
          name: `${name}__year`,
          title: "Year",
          schema: { min: 1000, max: 3000 },
          options: {
            required: isRequired,
            optionalText: optionalText,
            classes: "govuk-input--width-4",
            customValidationMessages: {
              "number.base": `${def.title} must include a year`,
            },
          },
          hint: "",
        },
      ],
      model
    );

    this.stateSchema = helpers.buildStateSchema("date", this);
  }

  getFormSchemaKeys() {
    return this.children.getFormSchemaKeys();
  }

  getStateSchemaKeys() {
    const { options } = this;
    const { maxDaysInPast, maxDaysInFuture } = options as any;
    let schema: any = this.stateSchema;

    schema = schema.custom(
      helpers.getCustomDateValidator(maxDaysInPast, maxDaysInFuture)
    );

    return { [this.name]: schema };
  }

  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    const dateValue = new Date(value);

    return {
      [`${name}__day`]: value && dateValue.getDate(),
      [`${name}__month`]: value && dateValue.getMonth() + 1,
      [`${name}__year`]: value && dateValue.getFullYear(),
    };
  }

  getStateValueFromValidForm(payload: FormPayload) {
    const name = this.name;

    return payload[`${name}__year`]
      ? new Date(
          payload[`${name}__year`],
          payload[`${name}__month`] - 1,
          payload[`${name}__day`]
        )
      : null;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? format(parseISO(value), "d MMMM yyyy") : "";
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

    const relevantErrors =
      errors?.errorList?.filter((error) => error.path.includes(this.name)) ??
      [];

    const firstError = relevantErrors[0];
    const errorMessage = firstError && { text: firstError?.text };

    return {
      ...viewModel,
      errorMessage,
      fieldset: {
        legend: viewModel.label,
      },
      items: componentViewModels,
    };
  }
}
