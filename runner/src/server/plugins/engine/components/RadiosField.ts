import { SelectionControlField } from "./SelectionControlField";
import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import joi from "joi";
/**
 * @description sorry about the empty class...
 * Exported Components must follow the naming convention implemented in @xgovformbuilder/model/components ComponentType.
 * In the Form JSON, components have a type property which is the name of the components, e.g. DateField.
 * Components are loaded in the ComponentsCollection constructor.
 */
export class RadiosField extends SelectionControlField {
    getViewModel(formData: FormData, errors: FormSubmissionErrors) {
      const viewModel = super.getViewModel(formData, errors);

      const items = viewModel.items ?? [];
      if (this.options.divider && items.length > 1) {
        items.splice(items.length - 1, 0, {"text": "filler", "value": "filler"});
        viewModel.items = items.map((item, index, arr) => ({
          ...item,
          ...(index === arr.length - 2 && { divider: "or" }),
        }));
      }
      return viewModel;
    }
}