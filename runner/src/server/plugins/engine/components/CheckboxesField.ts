import joi from "joi";
import * as helpers from "./helpers";

import { ConditionalFormComponent } from "./ConditionalFormComponent";

type ItemModel = {
  name?: string;
  text: string;
  value: any; // TODO
  checked: boolean;
  condition: any; // TODO
  label?: {
    classes: string;
  };
  hint?: {
    html: string;
  };
};

export class CheckboxesField extends ConditionalFormComponent {
  constructor(def, model) {
    super(def, model);
    const { options, values, itemValues } = this;
    const itemSchema = joi[values.valueType]().valid(...itemValues);
    const itemsSchema = joi.array().items(itemSchema);
    const alternatives = joi.alternatives([itemSchema, itemsSchema]);

    this.formSchema = helpers.buildFormSchema(
      alternatives,
      this,
      options.required !== false
    );
    this.stateSchema = helpers.buildStateSchema(alternatives, this);
  }

  getDisplayStringFromState(state) {
    const { name, values } = this;

    if (name in state) {
      const value = state[name];

      if (value === null) {
        return "";
      }

      const checked = Array.isArray(value) ? value : [value];
      return checked
        .map((check) => values.items.find((item) => item.value === check).label)
        .join(", ");
    }

    return "";
  }

  getViewModel(formData, errors) {
    const { name, values } = this;
    const viewModel = super.getViewModel(formData, errors);
    let formDataItems = [];

    if (name in formData) {
      formDataItems = Array.isArray(formData[name])
        ? formData[name]
        : formData[name].split(",");
    }

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.items = values.items.map((item) => {
      const itemModel: ItemModel = {
        text: this.localisedString(item.label),
        value: item.value,
        // Do a loose string based check as state may or
        // may not match the item value types.
        checked: !!formDataItems.find((i) => "" + item.value === i),
        condition: item.condition,
      };

      if (this.options.bold) {
        itemModel.label = {
          classes: "govuk-label--s",
        };
      }

      if (item.hint) {
        itemModel.hint = {
          html: this.localisedString(item.hint),
        };
      }

      return super.addConditionalComponents(item, itemModel, formData, errors);
    });

    return viewModel;
  }
}
