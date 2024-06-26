import joi, { Schema } from "joi";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormComponent } from "./FormComponent";
import { FormSubmissionState, FormSubmissionErrors, FormData } from "../types";
import { FormModel } from "./../models";
import { List, Item } from "@xgovformbuilder/model";
import { DataType, ListItem } from "./types";

export class ListFormComponent extends FormComponent {
  list: List;
  listType = "string";
  formSchema;
  stateSchema;
  options: ListComponentsDef["options"];
  dataType = "list" as DataType;

  get items(): Item[] {
    return this.list?.items ?? [];
  }
  get values(): (string | number | boolean)[] {
    return this.items?.map((item) => item.value) ?? [];
  }

  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    const { options } = def;
    // @ts-ignore
    this.list = model.getList(def.list);
    this.listType = this.list.type ?? "string";
    this.options = options;

    let componentSchema = joi[this.listType]();

    /**
     * Only allow a user to answer with values that have been defined in the list
     */
    if (options.required === false) {
      // null or empty string is valid for optional fields
      componentSchema = componentSchema.empty(null).valid(...this.values, "");
    } else {
      componentSchema = componentSchema.valid(...this.values).required();
    }

    if (options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        options.customValidationMessages
      );
    }

    componentSchema = componentSchema.label(def.title);

    this.formSchema = componentSchema;
    this.stateSchema = componentSchema;
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
    const item = items.find((item) => {
      return String(item.value) === String(value);
    });
    return `${item?.text ?? ""}`;
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name, items } = this;
    const viewModel = super.getViewModel(formData, errors);
    const viewModelItems: ListItem[] =
      items.map(({ text, value, description = "", condition }) => ({
        text: this.localisedString(text),
        value,
        description,
        selected: `${value}` === `${formData[name]}`,
        condition,
      })) ?? [];

    viewModel.items = viewModelItems;

    return viewModel;
  }
}
