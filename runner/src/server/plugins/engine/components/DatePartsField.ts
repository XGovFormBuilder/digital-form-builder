import { parseISO, format } from "date-fns";
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
    const { errorLabel } = options;
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
              "number.min": `${errorLabel} must be a real date`,
              "number.max": `${errorLabel} must be a real date`,
              "number.base": `${errorLabel} must include a day`,
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
              "number.min": `${errorLabel} must be a real date`,
              "number.max": `${errorLabel} must be a real date`,
              "number.base": `${errorLabel} must include a month`,
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
              "number.base": `${errorLabel} must include a year`,
              "number.max": `${errorLabel} must be in the past`,
              "number.min": "The year must include 4 numbers",
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

    // Add custom date validator
    schema = schema.custom(
      helpers.getCustomDateValidator(maxDaysInPast, maxDaysInFuture)
    );

    // Add custom validation messages if any
    if (options.customValidationMessages) {
      schema = schema.messages(options.customValidationMessages);
    }
    this.schema = schema;

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
    const day = payload[`${name}__day`];
    const month = payload[`${name}__month`];
    const year = payload[`${name}__year`];

    if (day && month && year) {
      const indexedMonth = month - 1; // Adjust month for zero-based index
      const parsedDate = new Date(year, indexedMonth, day);

      if (month - 1 === parsedDate.getMonth()) {
        return parsedDate;
      } else {
        return new Date(0, 0, 0); // Invalid date fallback
      }
    }
    // Workaround to force an error on optional date parts fields
    if (day && month && !year) {
      return new Date(100, 1, 1);
    }
    if (day && !month && year) {
      return new Date(200, 1, 1);
    }
    if (!day && month && year) {
      return new Date(300, 1, 1);
    }
    if (!day && month && !year) {
      return new Date(400, 1, 1);
    }
    if (day && !month && !year) {
      return new Date(500, 1, 1);
    }
    if (!day && !month && year) {
      return new Date(600, 1, 1);
    }

    return null;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? format(parseISO(value), "d MMMM yyyy") : "";
  }

  // @ts-ignore - eslint does not report this as an error, only tsc
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    viewModel.label!.classes = "govuk-fieldset__legend--s";
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
    const errorMessage = firstError && {
      text: firstError?.text,
    };

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
