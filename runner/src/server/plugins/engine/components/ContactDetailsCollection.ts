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
import { ListItem } from "./types"; // check this

// TODO FIX IT SO IT CORRECTLY DISPLAYS THE INTERNAL NESTED COMPONENTS
// SHOULD CORRECTLY DISPLAY
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
            required: false,
            optionalText: false,
            customValidationMessages: {
              "string.pattern.base": "Enter a valid UK mobile number",
            },
          },
          schema: {
            regex:
              "(?!0{5,})(((\\+44\\s?(?!4|6)\\d{4}|\\(?0(?!4|6)\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?(?!4|6)\\d{3}|\\(?0(?!4|6)\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?(?!4|6)\\d{2}|\\(?0(?!4|6)\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))(\\s?\\#(\\d{4}|\\d{3}))?",
          },
        },
        // {
        //   type: "TelephoneNumberField",
        //   name: "landline_number", // I don't know why the titles to the componets in my collection are not being picked up
        //   title: "Landline number",
        //   hint: "For example, 01632 960999",
        //   options: {
        //     required: false, // landline is optional
        //     optionalText: false,
        //     customValidationMessages: {
        //       "string.pattern.base": "Random incorrect value",
        //     },
        //     schema: {
        //       regex: "^0([1-6][\\s\\d]{8,12})$",
        //     },
        //   },
        // },
        {
          type: "EmailAddressField",
          name: "email_address",
          title: "Email address",
          hint: "For example, name@example.com",
          options: {
            required: false,
            optionalText: false,
            customValidationMessages: {
              "string.email": "Enter an email address in the correct format",
            },
          },
        },
      ] as any,
      model
    );

    // Build a state schema that validates the whole contact details object
    let stateSchema = Joi.object({
      mobile_number: Joi.string().empty(["", null]),
      landline_number: Joi.string().empty(["", null]),
      email_address: Joi.string().email().empty(["", null]),
    });

    // const isRequired = (this.options as any).required !== false;
    // TODO: CHANGE THIS BACK TO CHECKING THE OPTION, NOT HARD-CODED. For now, hard-code to required to unblock development of the new summary page, which needs the display string to be generated for the contact details collection.
    const isRequired = true;

    if (isRequired) {
      stateSchema = stateSchema.or("mobile_number", "email_address").messages({
        "object.missing":
          (this.options as any).customValidationMessages?.["any.required"] ??
          "Enter a mobile number or email address so we can contact you",
      });
    }

    this.stateSchema = stateSchema;
  }

  getFormSchemaKeys() {
    console.log("[ContactDetails] === getFormSchemaKeys ===");
    const childrenKeys = this.children.getFormSchemaKeys();
    const isRequired = true; // (this.options as any).required !== false;

    if (!isRequired) {
      return childrenKeys;
    }

    return {
      ...childrenKeys,
      [this.name]: Joi.any()
        .default(null)
        .custom((_value, helpers) => {
          const root = helpers.state.ancestors[0] as any;

          const hasMobile =
            root?.mobile_number && String(root.mobile_number).trim() !== "";
          const hasEmail =
            root?.email_address && String(root.email_address).trim() !== "";
          console.log("hasMobile →", hasMobile);
          console.log("hasEmail →", hasEmail);
          if (!hasMobile && !hasEmail) {
            return helpers.error("any.invalid");
          }
          return _value;
        })
        .messages({
          "any.invalid":
            (this.options as any).customValidationMessages?.["any.required"] ??
            "Provide a mobile number, email or both", // Change this error to have a name so it can be passed in
        }),
    };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

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

    console.log("[ContactDetails] === getViewModel ===");
    console.log("  this.title →", JSON.stringify(this.title));
    console.log("  this.options →", JSON.stringify(this.options));
    console.log("  super viewModel.label →", JSON.stringify(viewModel.label));
    console.log("  super viewModel.hint →", JSON.stringify(viewModel.hint));

    const componentViewModels = this.children
      .getViewModel(formData, errors)
      .map((vm) => vm.model);

    componentViewModels.forEach((componentViewModel) => {
      // I AM NOT SURE WHAT THIS BIT IS DOING
      // componentViewModel.label = componentViewModel.label?.text?.replace(
      //   optionalText,
      //   ""
      // ) as any;

      if (componentViewModel.errorMessage) {
        componentViewModel.classes += " govuk-input--error";
      }
    });

    return {
      ...viewModel,
      fieldset: { legend: viewModel.label },
      items: (componentViewModels as unknown) as ListItem[],
    };
  }
}
