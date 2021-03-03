import { Schema } from "joi";
import { ListComponentsDef, Item, List } from "@xgovformbuilder/model";
import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormSubmissionState, FormSubmissionErrors, FormData } from "../types";
import { FormModel } from "../models";

export class ListFormComponent extends FormComponent {
  list: List;

  get items(): Item[] {
    return this.list.items;
  }
  get values() {
    return this.items.map((item) => `${item.value}`);
  }

  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    this.list = model.getList(def.list);

    this.formSchema = helpers.buildFormSchema("string", this);
    this.stateSchema = helpers
      .buildStateSchema("string", this)
      .valid(...this.values);
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name, items } = this;
    const value = state[name];
    return items.find((item) => item.value === value)?.value;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const viewModel = super.getViewModel(formData, errors);

    const viewModelItems =
      items.map(({ text, value, condition }) => ({
        text: this.localisedString(text),
        value,
        selected: `${value}` === `${formData[name]}`,
        condition,
      })) ?? [];

    console.error("hello");
    console.error(viewModelItems);

    viewModel.items = [{ text: "" }, ...viewModelItems];

    return viewModel;
  }
}
