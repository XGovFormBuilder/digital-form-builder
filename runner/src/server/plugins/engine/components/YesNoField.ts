import { Schema } from "joi";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { addClassOptionIfNone } from "./helpers";

export class YesNoField extends FormComponent {
  list = {
    name: "__yesNo",
    title: "Yes/No",
    type: "boolean",
    items: [
      {
        text: "Yes",
        value: true,
      },
      {
        text: "No",
        value: false,
      },
    ],
  };

  items = [
    {
      text: "Yes",
      value: true,
    },
    {
      text: "No",
      value: false,
    },
  ];

  constructor(def, model) {
    super(def, model);

    const { options } = this;

    const values = [true, false];
    this.values = values;
    const formSchema = helpers
      .buildFormSchema("boolean", this, options.required !== false)
      .valid(true, false);
    const stateSchema = helpers
      .buildStateSchema(this.list.type, this)
      .valid(true, false);

    this.formSchema = formSchema;
    this.stateSchema = stateSchema;
    addClassOptionIfNone(this.options, "govuk-radios--inline");
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name, values } = this;
    const value = state[name];
    const item = values?.items.find((item) => item.value === value);
    return item ? item.label : "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, values } = this;
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = values?.items.map((item) => ({
      text: item.label,
      value: item.value,
      // Do a loose string based check as state may or
      // may not match the item value types.
      checked: "" + item.value === "" + formData[name],
    }));

    return viewModel;
  }
}
