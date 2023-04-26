import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import { optionalText } from "./constants";
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
    let a = this.children.getStateFromValidForm(payload);
    let b = {};

    this.children.formItems.forEach((item) => {
      Object.assign(b, item.getStateFromValidForm(payload));
    });

    return this.children.getStateFromValidForm(payload);
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const values = state[this.name];
    const stringValue = new Array();
    if (values) {
      for (var value of values) {
        let outputString = "";
        for (const key in value) {
          outputString += `${value[key]} : `;
        }
        outputString = outputString.slice(0, -1);
        if (typeof value === "string") {
          stringValue.push(value);
        } else {
          stringValue.push(outputString);
        }
      }
    }
    return stringValue;
  }

  // @ts-ignore - eslint does not report this as an error, only tsc
  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    // Use the component collection to generate the subitems
    const componentViewModels = this.children
      .getViewModel(formData, errors)
      .map((vm) => {
        vm.model.type = vm.type;
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
