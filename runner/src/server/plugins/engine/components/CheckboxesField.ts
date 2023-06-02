import { FormData, FormSubmissionErrors, FormSubmissionState } from "../types";
import { ListComponentsDef } from "@xgovformbuilder/model";
import { FormModel } from "../models";
import joi from "joi";
import { SelectionControlField } from "server/plugins/engine/components/SelectionControlField";

export class CheckboxesField extends SelectionControlField {
  constructor(def: ListComponentsDef, model: FormModel) {
    super(def, model);

    let schema = joi
      .array()
      .items(joi[this.listType]().allow(...this.values))
      .single()
      .label(def.title);

    if (def.options.required !== false) {
      schema = schema.required();
    }

    this.formSchema = schema;
    this.stateSchema = schema;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    return state?.[this.name]
      ?.map(
        (value) =>
          this.items.find((item) => `${item.value}` === `${value}`)?.text ?? ""
      )
      .join(", ");
  }

  getAdditionalValidationFunctions(): Function[] {
    return [
      async (request, viewModel) => {
        const checkboxesComponent = viewModel.components.find(
          (c) => c.model.name === this.name
        );
        const payload = (request.payload || {}) as FormData;
        let values = payload[this.name];

        const componentKey = checkboxesComponent.model.id;

        const error = {
          path: componentKey,
          name: componentKey,
          href: `#${componentKey}`,
        };

        if (!this.options.behaviour) {
          return [];
        }

        if (
          values.some((value) => value === this.options.behaviourItemValue) &&
          values.length > 1
        ) {
          return [
            {
              ...error,
              ...{
                text: `You cannot select ‘None of these’ and another option`,
              },
            },
          ];
        }

        return [];
      },
    ];
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);
    let formDataItems = formData[this.name];
    if (
      typeof formDataItems === "string" ||
      typeof formDataItems === "undefined"
    ) {
      formDataItems = (formDataItems ?? "").split(",");
    }
    viewModel.items = (viewModel.items ?? []).map((item) => ({
      ...item,
      checked: !!formDataItems.find((i) => `${item.value}` === i),
    }));

    if (this.options.divider) {
      let divider = { divider: this.options.divider };
      viewModel.items.splice(viewModel.items.length - 1, 0, divider);
    }

    if (this.options.behaviour) {
      viewModel.items[
        viewModel.items.length - 1
      ].behaviour = this.options.behaviour;
    }

    return viewModel;
  }
}
