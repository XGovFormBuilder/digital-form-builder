import { Schema } from "joi";
import { ListComponents, StaticValue } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormSubmissionState, FormSubmissionErrors, FormData } from "../types";
import { FormModel } from "../formModel";

export class SelectField extends FormComponent {
  items: Array<StaticValue> | undefined;

  constructor(def: ListComponents, model: FormModel) {
    super(def, model);

    const { values } = this;
    const formSchema = helpers.buildFormSchema("string", this);
    const itemValues = values?.items.map((item) => item.value) ?? [];

    const stateSchema = helpers
      .buildStateSchema(values?.valueType, this)
      .valid(...itemValues);

    this.items = values?.items;
    this.formSchema = formSchema;
    this.stateSchema = stateSchema;
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
    const item: any = values?.items.find((item) => item.value === value);
    return item?.value;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, values } = this;
    const viewModel = super.getViewModel(formData, errors);

    const items =
      values?.items.map((item) => ({
        text: this.localisedString(item.label),
        value: item.value,
        selected: `${item.value}` === `${formData[name]}`,
        condition: item.condition,
      })) ?? [];

    viewModel.items = [{ text: "" }, ...items];

    return viewModel;
  }
}
