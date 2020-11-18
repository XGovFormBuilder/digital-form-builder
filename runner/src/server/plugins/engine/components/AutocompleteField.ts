import { ListComponents } from "@xgovformbuilder/model";

import { SelectField } from "./SelectField";
import { FormModel } from "../formModel";
import { addClassOptionIfNone } from "./helpers";

export class AutocompleteField extends SelectField {
  constructor(def: ListComponents, model: FormModel) {
    super(def, model);
    addClassOptionIfNone(this.options, "govuk-input--width-20");
  }
}
