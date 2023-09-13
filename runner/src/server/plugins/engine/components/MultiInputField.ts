import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import { optionalTextEnglish } from "./constants";
import { optionalTextCymraeg } from "./constants";
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
import { parseISO, format } from "date-fns";

export class MultiInputField extends FormComponent {
  children: ComponentCollection;
  dataType = "multiInput" as DataType;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    const options: any = this.options;

    this.children = new ComponentCollection(def.children as any, model);
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

  getPrefix(key: string) {
    const item = this.children.formItems.find((item) => item.name === key);
    return item && item.options.prefix ? item.options.prefix : "";
  }

  getComponentType(name) {
    const children = this.children.formItems;
    const foundItem = children.find((item) => item.name === name);
    return foundItem ? foundItem.type : undefined;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const answers = state[this.name];
    const stringValue = new Array();

    if (answers) {
      for (const answer of answers) {
        if (typeof answer === "string") {
          stringValue.push(answer);
          continue;
        }

        const keyToRenderedValue = {};
        for (const [key, value] of Object.entries(answer)) {
          const componentType = this.getComponentType(key);
          if (value == null) {
            keyToRenderedValue[key] = "Not supplied";
          } else if (componentType == "DatePartsField") {
            keyToRenderedValue[key] = `${format(parseISO(value), "d/MM/yyyy")}`;
          } else if (componentType == "MonthYearField") {
            keyToRenderedValue[key] = `${value[`${key}__month`]}/${
              value[`${key}__year`]
            }`;
          } else if (componentType == "YesNoField") {
            keyToRenderedValue[key] = value ? "Yes" : "No";
          } else if (componentType == "UkAddressField") {
            keyToRenderedValue[key] = value
              ? [
                  value.addressLine1,
                  value.addressLine2,
                  value.town,
                  value.county,
                  value.postcode,
                ]
                  .filter((p) => {
                    return !!p;
                  })
                  .join(", ")
              : "";
          } else {
            keyToRenderedValue[key] = `${this.getPrefix(key)}${value}`;
          }
        }

        const sortedNames = this.children.items.map((x) => x.name);
        const outputString = sortedNames
          .map((name) => keyToRenderedValue[name])
          .join(" : ");
        stringValue.push(outputString);
      }
    }

    return stringValue;
  }

  // @ts-ignore - eslint does not report this as an error, only tsc
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    const optionalText = this.model?.def?.metadata?.isWelsh
      ? optionalTextCymraeg
      : optionalTextEnglish;

    // Use the component collection to generate the subitems
    const componentViewModels = this.children
      .getViewModel(formData, errors)
      .map((vm) => {
        vm.model.componentType = vm.type;
        return vm.model;
      });

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

    return {
      ...viewModel,
      fieldset: {
        legend: viewModel.label,
      },
      items: componentViewModels,
    };
  }
}
