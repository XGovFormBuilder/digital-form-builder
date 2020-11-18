import moment from "moment";
import { InputFieldsComponents } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormSubmissionState } from "../types";
import { FormModel } from "../formModel";

export class DateTimeField extends FormComponent {
  constructor(def: InputFieldsComponents, model: FormModel) {
    super(def, model);
    const { options } = this;

    if (!options.classes) {
      options.classes = "govuk-input--width-20";
    }
  }

  getFormSchemaKeys() {
    return helpers.getFormSchemaKeys(this.name, "date", this);
  }

  getStateSchemaKeys() {
    return helpers.getStateSchemaKeys(this.name, "date", this);
  }

  getFormValueFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? moment(value).format("YYYY-MM-DDTHH:mm") : value;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? moment(value).format("D MMMM YYYY h:mma") : "";
  }

  getViewModel(formData, errors) {
    const viewModel = super.getViewModel(formData, errors);
    viewModel.type = "datetime-local";
    return viewModel;
  }
}
