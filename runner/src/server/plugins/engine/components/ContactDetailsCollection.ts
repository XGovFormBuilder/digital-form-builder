import { Schema } from "joi";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import Joi from "joi";

import { optionalText } from "./constants";
import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";

export class ContactDetailsCollection extends FormComponent {
  children: ComponentCollection;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);
    const options: any = this.options;

    this.children = new ComponentCollection(
      [
        {
          type: "TelephoneNumberField",
          name: "mobile_number",
          title: "Mobile number",
          hint: "For example, 07700 900999",
          options: {
            required: options.required,
            customValidationMessages: {
              "string.empty": "Enter a mobile number",
              "string.pattern.base": "Enter a valid UK mobile number",
            },
          },
        },
        {
          type: "TelephoneNumberField",
          name: "landline_number",
          title: "Landline number",
          hint: "For example, 01632 960999",
          options: {
            required: false, // landline is optional
            optionalText: true,
            customValidationMessages: {
              "string.pattern.base": "Enter a valid landline number",
            },
          },
        },
        {
          type: "EmailAddressField",
          name: "email_address",
          title: "Email address",
          hint: "For example, name@example.com",
          options: {
            required: options.required,
            customValidationMessages: {
              "string.empty": "Enter an email address",
              "string.email": "Enter an email address in the correct format",
            },
          },
        },
      ] as any,
      model
    );

    // Build a state schema that validates the whole contact details object
    this.stateSchema = Joi.object({
      mobile_number: Joi.string().required(),
      landline_number: Joi.string().optional().allow("", null),
      email_address: Joi.string().email().required(),
    });
  }

  // Expose child field keys for form-level validation
  getFormSchemaKeys() {
    return this.children.getFormSchemaKeys();
  }

  // Expose a single namespaced key for state-level validation
  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  // Unpack stored state back into individual form fields
  getFormDataFromState(state: FormSubmissionState) {
    const name = this.name;
    const value = state[name] ?? {};
    return {
      mobile_number: value.mobile_number ?? "",
      landline_number: value.landline_number ?? "",
      email_address: value.email_address ?? "",
    };
  }

  // Pack submitted form fields back into a single state value
  getStateValueFromValidForm(payload: FormPayload) {
    return {
      mobile_number: payload["mobile_number"] || null,
      landline_number: payload["landline_number"] || null,
      email_address: payload["email_address"] || null,
    };
  }

  // Human-readable summary for review pages
  getDisplayStringFromState(state: FormSubmissionState) {
    const value = state[this.name];
    if (!value) return "";
    const parts = [
      value.mobile_number,
      value.landline_number,
      value.email_address,
    ].filter(Boolean);
    return parts.join(", ");
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    const componentViewModels = this.children
      .getViewModel(formData, errors)
      .map((vm) => vm.model);

    componentViewModels.forEach((componentViewModel) => {
      componentViewModel.label = componentViewModel.label?.text?.replace(
        optionalText,
        ""
      ) as any;

      if (componentViewModel.errorMessage) {
        componentViewModel.classes += " govuk-input--error";
      }
    });

    return {
      ...viewModel,
      fieldset: {
        legend: viewModel.label,
      },
      items: (componentViewModels as unknown) as ListItem[],
    };
  }
}
