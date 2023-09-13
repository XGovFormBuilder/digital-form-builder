import { add, sub, format, parseISO } from "date-fns";
import { addClassOptionIfNone } from "./helpers";
import { DateFieldComponent } from "@xgovformbuilder/model";

import { FormComponent } from "./FormComponent";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { FormModel } from "../models";
import { DataType } from "server/plugins/engine/components/types";
import joi from "joi";

export class DateField extends FormComponent {
  dataType = "date" as DataType;
  constructor(def: DateFieldComponent, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-10");
    let { options = {} } = def;

    let schema = joi.date();

    schema = schema.label(def.title.toLowerCase());
    const { maxDaysInPast, maxDaysInFuture } = options;

    if (maxDaysInPast ?? false) {
      schema = schema.min(sub(new Date(), { days: maxDaysInPast }));
    }

    if (maxDaysInFuture ?? false) {
      schema = schema.max(add(new Date(), { days: maxDaysInFuture }));
    }

    if (options.required === false) {
      const optionalSchema = joi
        .alternatives()
        .try(joi.string().allow(null).allow("").default("").optional(), schema);
      this.schema = optionalSchema;
    } else {
      this.schema = schema;
    }
  }

  getFormSchemaKeys() {
    return { [this.name]: this.schema as joi.Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.schema as joi.Schema };
  }

  getFormValueFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? format(parseISO(value), "yyyy-MM-dd") : value;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return value ? format(parseISO(value), "d MMMM yyyy") : "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    return {
      ...super.getViewModel(formData, errors),
      type: "date",
    };
  }
}
