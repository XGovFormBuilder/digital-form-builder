import { ListComponentsDef } from "@xgovformbuilder/model";

import { SelectField } from "./SelectField";
import { FormModel } from "../models";
import { addClassOptionIfNone } from "./helpers";
import { FormSubmissionState } from "server/plugins/engine/types";

export class AutocompleteField extends SelectField {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);

    let componentSchema = this.formSchema.messages({
      "any.only": "Enter {{#label}}",
    });
    if (def.options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        def.options.customValidationMessages
      );
    }
    this.formSchema = componentSchema;
    this.stateSchema = componentSchema;
    addClassOptionIfNone(this.options, "govuk-input--width-20");
  }
  getDisplayStringFromState(state: FormSubmissionState): string {
    const { name, items } = this;
    const value = state[name];
    if (Array.isArray(value)) {
      return items
        .filter((item) => value.includes(item.value))
        .map((item) => item.text)
        .join(", ");
    }
    const item = items.find((item) => String(item.value) === String(value));
    return `${item?.text ?? ""}`;
  }
}
