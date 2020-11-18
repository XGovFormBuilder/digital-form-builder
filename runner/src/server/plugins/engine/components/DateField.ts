import moment from "moment";
import {
  getFormSchemaKeys,
  getStateSchemaKeys,
  addClassOptionIfNone,
} from "./helpers";
import { InputFieldsComponents } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormSubmissionState } from "../types";
import { FormModel } from "../formModel";

export class DateField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-10");
  }

  getFormSchemaKeys() {
    return getFormSchemaKeys(this.name, "date", this);
  }

  getStateSchemaKeys() {
    return getStateSchemaKeys(this.name, "date", this);
  }

  getFormValueFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? moment(value).format("YYYY-MM-DD") : value;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? moment(value).format("D MMMM YYYY") : "";
  }

  getViewModel(formData, errors) {
    const viewModel = super.getViewModel(formData, errors);
    viewModel.type = "date";
    return viewModel;
  }

  get dataType() {
    return "date";
  }
}
