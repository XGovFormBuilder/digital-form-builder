import { NationalInsuranceFieldComponent } from "@xgovformbuilder/model";
import joi, { Schema } from "joi";

import { FormModel } from "../models";
import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";

import { addClassOptionIfNone } from "./helpers";

export class NationalInsuranceField extends FormComponent {
  constructor(def: NationalInsuranceFieldComponent, model: FormModel) {
    super(def, model);
    let schema = joi
      .string()
      .regex(
        new RegExp(
          /^[a-ceghj-pr-tw-zA-CEGHJ-PR-TW-Z]{1}[a-ceghj-npr-tw-zA-CEGHJ-NPR-TW-Z]{1} ?[0-9]{2} ?[0-9]{2} ?[0-9]{2} ?[a-dA-D]{1}$/
        )
      );

    if (def.options.required !== false) {
      schema = schema.required();
    } else {
      schema = schema.allow("");
    }

    this.formSchema = schema;
    this.stateSchema = schema;

    addClassOptionIfNone(this.options, "govuk-input--width-20");
  }

  getFormSchemaKeys() {
    return { [this.name]: this.formSchema as Schema };
  }
  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    viewModel.type = "nationalInsurance";

    return viewModel;
  }
}
