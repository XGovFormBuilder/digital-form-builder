import { add, sub, format, parseISO } from "date-fns";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";

export class DateTimeField extends FormComponent {
  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-20");
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
    const a = format(parseISO(value), "YYYY-MM-DDTHH:mm");
    return value ? format(parseISO(value), "YYYY-MM-DDTHH:mm") : value;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? format(parseISO(value), "D MMMM YYYY h:mma") : "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    return {
      ...super.getViewModel(formData, errors),
      type: "datetime-local",
    };
  }
}
