import { Schema } from "joi";

import * as helpers from "./helpers";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { addClassOptionIfNone } from "./helpers";
import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";

export class YesNoField extends ListFormComponent {
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

  get items() {
    return this.list?.items ?? [];
  }

  get values() {
    return [true, false];
  }

  constructor(def, model) {
    super(def, model);

    const { options } = this;

    this.formSchema = helpers
      .buildFormSchema("boolean", this, options.required !== false)
      .valid(true, false);
    this.stateSchema = helpers
      .buildStateSchema(this.list.type, this)
      .valid(true, false);

    addClassOptionIfNone(this.options, "govuk-radios--inline");
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const value = state[this.name];
    const item = this.items.find((item) => item.value === value);
    return item ? item.label : "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };
    console.log(this.items);
    viewModel.items = this.items.map(({ text, value }) => ({
      text,
      value,
      checked: value === formData[this.name],
    }));

    return viewModel;
  }
}
