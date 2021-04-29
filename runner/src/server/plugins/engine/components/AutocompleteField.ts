import { ListComponentsDef } from "@xgovformbuilder/model";

import { SelectField } from "./SelectField";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import { FormSubmissionErrors, FormData } from "../types";

export class AutocompleteField extends SelectField {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-20");
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    viewModel.items = [{ value: "" }, ...(viewModel.items ?? [])];
    return viewModel;
  }
}
