import { ListComponentsDef } from "@xgovformbuilder/model";

import { SelectField } from "./SelectField";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";

export class AutocompleteField extends SelectField {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-20");
  }
}
