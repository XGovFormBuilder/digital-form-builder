import joi from "joi";

import { InputFieldsComponentsDef } from "@xgovformbuilder/model";

import * as helpers from "./helpers";
import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";
import { i18n } from "../../i18n";

export class UkAddressField extends FormComponent {
  formChildren: ComponentCollection;
  stateChildren: ComponentCollection;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    const { name, options } = this;
    const stateSchema = helpers.buildStateSchema("date", this);
    const isRequired =
      "required" in options && options.required === false ? false : true;

    let addressLine1Title = "Address line 1";
    let addressLine2Title = "Address line 2";
    let townCityText = "Town or city";
    let county = "County";
    let postcode = "Postcode";

    if (model.def.metadata?.isWelsh) {
      addressLine1Title = "Llinell cyfeiriad 1";
      addressLine2Title = "Llinell cyfeiriad 2";
      townCityText = "Tref neu ddinas";
      county = "Sir";
      postcode = "Cod post";
    }

    const childrenList: any = [
      {
        type: "TextField",
        name: "addressLine1",
        title: addressLine1Title,
        schema: { max: 100 },
        options: { required: isRequired, classes: "govuk-!-width-full" },
      },
      {
        type: "TextField",
        name: "addressLine2",
        title: addressLine2Title,
        schema: { max: 100, allow: "" },
        options: { required: false, classes: "govuk-!-width-full" },
      },
      {
        type: "TextField",
        name: "town",
        title: townCityText,
        schema: { max: 100 },
        options: { required: isRequired, classes: "govuk-!-width-two-thirds" },
      },
      {
        type: "TextField",
        name: "county",
        title: county,
        schema: { max: 100 },
        options: { required: false, classes: "govuk-!-width-two-thirds" },
      },
      {
        type: "TextField",
        name: "postcode",
        title: postcode,
        schema: {
          max: 10,
          regex:
            "^([A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2})$",
        },
        options: {
          required: isRequired,
          customValidationMessage: "Enter a valid postcode",
          classes: "govuk-!-width-one-half",
        },
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
    const { name } = this;
    const options: any = this.options;

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

    if (typeof value === "string") {
      return this.convertStringAnswers(name, value);
    }
    return {
      [`${name}__addressLine1`]: value && value.addressLine1,
      [`${name}__addressLine2`]: value && value.addressLine2,
      [`${name}__town`]: value && value.town,
      [`${name}__county`]: value && value.county,
      [`${name}__postcode`]: value && value.postcode,
    };
  }

  getStateValueFromValidForm(payload: FormPayload) {
    const name = this.name;
    return payload[`${name}__addressLine1`]
      ? {
          addressLine1: payload[`${name}__addressLine1`],
          addressLine2: payload[`${name}__addressLine2`],
          town: payload[`${name}__town`],
          county: payload[`${name}__county`],
          postcode: payload[`${name}__postcode`],
        }
      : null;
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name];

    if (typeof value !== "string" && typeof value !== "undefined") {
      value.addressLine2 =
        value.addressLine2 === "" ? "null" : value.addressLine2;
      value.county = value.county === "" ? "null" : value.county;
    }

    if (typeof value === "string") {
      return value;
    }

    return value
      ? [
          value.addressLine1,
          value.addressLine2,
          value.town,
          value.county,
          value.postcode,
        ]
          .filter((p) => {
            return !!p;
          })
          .join(", ")
      : "";
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const options: any = this.options;
    const viewModel = {
      ...super.getViewModel(formData, errors),
      children: this.formChildren.getViewModel(formData, errors),
    };

    viewModel.fieldset = {
      legend: viewModel.label,
    };

    const { disableLookup } = options;

    if (disableLookup !== undefined) {
      viewModel.disableLookup = disableLookup;
    } else {
      viewModel.disableLookup = true;
    }

    return viewModel;
  }

  // This method is used to solve the issue of the address fields appearing blank when
  // returning to a completed section of a form.
  convertStringAnswers(name: string, value: any) {
    const address = value.split(", ");

    return {
      [`${name}__addressLine1`]: value && address[0],
      [`${name}__addressLine2`]:
        value && address[1] === "null" ? "" : address[1],
      [`${name}__town`]: value && address[2],
      [`${name}__county`]: value && address[3] === "null" ? "" : address[3],
      [`${name}__postcode`]: value && address[4],
    };
  }
}
