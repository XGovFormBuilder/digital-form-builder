import { ListComponents } from "@xgovformbuilder/model";

import { SelectField } from "./SelectField";
import { FormModel } from "../formModel";

export class AutocompleteField extends SelectField {
  constructor(def: ListComponents, model: FormModel) {
    super(def, model);

    const { options } = this;

    if (!("classes" in options) || !options.classes) {
      this.options = {
        ...options,
        classes: "govuk-input--width-20",
      };
    }
  }
}
