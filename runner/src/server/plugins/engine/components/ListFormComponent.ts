import joi, { Schema } from "joi";
import { ListComponentsDef, Item, List } from "@xgovformbuilder/model";
import { FormComponent } from "./FormComponent";
import { FormSubmissionState, FormSubmissionErrors, FormData } from "../types";
import { FormModel } from "../models";

export class ListFormComponent extends FormComponent {
  list: List;
  listType: "number" | "string";
  formSchema;
  stateSchema;

  get items(): Item[] {
    return this.list.items;
  }
  get values() {
    return this.items.map((item) => item.value);
  }

  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    this.list = model.getList(def.list);
    this.listType = this.list.type ?? "string";
    const { options, values } = this;

    const schema = joi[this.listType]()
      .allow(...values)
      .label(def.title);

    const isRequired = options?.required ?? true;
    isRequired && schema.required();
    this.formSchema = schema;
    this.stateSchema = schema;
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getDisplayStringFromState(state: FormSubmissionState): string | string[] {
    const { name, items } = this;
    const value = state[name];
    return items.find((item) => item.value === value)?.value ?? "";
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

    viewModel.items = [...viewModelItems];

    return viewModel;
  }
}
