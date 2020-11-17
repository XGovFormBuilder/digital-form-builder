import joi from "joi";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import { FormSubmissionState } from "../types";

export class UkAddressField extends FormComponent {
  formChildren: ComponentCollection;
  stateChildren: ComponentCollection;

  constructor(def, model) {
    super(def, model);
    const { name, options } = this;
    const stateSchema = helpers.buildStateSchema("date", this);

    const childrenList = [
      {
        type: "TextField",
        name: "addressLine1",
        title: "Address line 1",
        schema: { max: 100 },
        options: { required: options.required },
      },
      {
        type: "TextField",
        name: "addressLine2",
        title: "Address line 2",
        schema: { max: 100, allow: "" },
        options: { required: false },
      },
      {
        type: "TextField",
        name: "town",
        title: "Town or city",
        schema: { max: 100 },
        options: { required: options.required },
      },
      {
        type: "TextField",
        name: "postcode",
        title: "Postcode",
        schema: { max: 10 },
        options: { required: options.required },
      },
    ];

    const stateChildren = new ComponentCollection(childrenList, model);

    // Modify the name to add a prefix and reuse
    // the children to create the formComponents
    childrenList.forEach((child) => (child.name = `${name}__${child.name}`));

    const formChildren = new ComponentCollection(childrenList, model);

    this.formChildren = formChildren;
    this.stateChildren = stateChildren;
    this.stateSchema = stateSchema;
  }

  getFormSchemaKeys() {
    return this.formChildren.getFormSchemaKeys();
  }

  getStateSchemaKeys() {
    const { name, options } = this;
    return {
      [name]:
        options.required === false
          ? joi
              .object()
              .keys(this.stateChildren.getStateSchemaKeys())
              .allow(null)
          : joi
              .object()
              .keys(this.stateChildren.getStateSchemaKeys())
              .required(),
    };
  }

  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];
    return {
      [`${name}__addressLine1`]: value && value.addressLine1,
      [`${name}__addressLine2`]: value && value.addressLine2,
      [`${name}__town`]: value && value.town,
      [`${name}__postcode`]: value && value.postcode,
    };
  }

  getStateValueFromValidForm(payload) {
    const name = this.name;
    return payload[`${name}__addressLine1`]
      ? {
          addressLine1: payload[`${name}__addressLine1`],
          addressLine2: payload[`${name}__addressLine2`],
          town: payload[`${name}__town`],
          postcode: payload[`${name}__postcode`],
        }
      : null;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];

    return value
      ? [value.addressLine1, value.addressLine2, value.town, value.postcode]
          .filter((p) => {
            return !!p;
          })
          .join(", ")
      : "";
  }

  getViewModel(formData, errors) {
    const viewModel = super.getViewModel(formData, errors);

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    viewModel.children = this.formChildren.getViewModel(formData, errors);

    const { disableLookup } = this.options;

    if (disableLookup !== undefined) {
      viewModel.disableLookup = disableLookup;
    } else {
      viewModel.disableLookup = true;
    }

    return viewModel;
  }
}
