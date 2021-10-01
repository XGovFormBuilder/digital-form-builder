import moment from "moment";
import {
  getFormSchemaKeys,
  getStateSchemaKeys,
  addClassOptionIfNone,
} from "./helpers";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormModel } from "../models";
import { DataType } from "server/plugins/engine/components/types";

export class DateField extends FormComponent {
  dataType = "date" as DataType;
  constructor(def: InputFieldsComponentsDef, model: FormModel) {
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

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    return {
      ...super.getViewModel(formData, errors),
      type: "date",
    };
  }
}
