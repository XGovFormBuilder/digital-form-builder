import joi from "joi";
import * as helpers from "./helpers";

import { FormModel } from "../models";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";

export class CheckboxesField extends ListFormComponent {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    const { options, values } = this;
    console.log(values);
    const type = this.list.type ?? "string";
    const itemsSchema = joi[type]().allow(...values);
    const isRequired = options?.required ?? true;

    this.formSchema = helpers.buildFormSchema(itemsSchema, this, isRequired);
    this.stateSchema = helpers.buildStateSchema(itemsSchema, this);
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const { name } = this;

    if (name in state) {
      const value = state[name];

      if (value === null) {
        return "";
      }

      const checked = Array.isArray(value) ? value : [value];
      return checked
        .map((check) => {
          const item = this.items.find((item) => item.value === check);
          return item?.label;
        })
        .join(",");
    }

    return "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { name } = this;
    const viewModel = super.getViewModel(formData, errors);
    let formDataItems = [];

    console.log("checkboxes,", viewModel);
    if (name in formData) {
      console.log("fd", formData, formData[name]);
      formDataItems = Array.isArray(formData[name])
        ? formData[name]
        : formData[name].split(",");
      console.log("form data items", formDataItems);
    }

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = viewModel.items.map((item) => {
      const itemModel = {
        ...item,
        checked: !!formDataItems.find((i) => `${item.value}` === i),
      };
      if ("bold" in this.options && this.options.bold) {
        itemModel.label = {
          classes: "govuk-label--s",
        };
      }
      if (item.hint) {
        itemModel.hint = {
          html: this.localisedString(item.hint),
        };
      }
      //return super.addConditionalComponents(item, itemModel, formData, errors);
      return itemModel;
    });

    return viewModel;
  }
}
