import { Schema } from "joi";
import { InputFieldsComponentsDef } from "@xgovformbuilder/model";
import Joi from "joi";

import { FormComponent } from "./FormComponent";
import { ComponentCollection } from "./ComponentCollection";
import {
  FormData,
  FormPayload,
  FormSubmissionErrors,
  FormSubmissionState,
} from "../types";
import { FormModel } from "../models";
import { ListItem } from "./types";

/**
 * Composite component rendering mobile number + email + landline inside a single fieldset,
 * with a cross-field rule: at least one of the mobile or email must be provided (when the
 * component is required).
 *
 * The "at least one" rule is enforced in Pass 1 (form schema) via a synthetic
 * key on `this.name`. A hidden <input> with the same name is rendered alongside
 * the visible inputs so that key is always present in the payload — Joi only
 * runs validators on keys that exist in the input being validated.
 */
export class ContactDetailsCollection extends FormComponent {
  children: ComponentCollection;

  // Joi schema for the cross-field "at least one of mobile/email" rule.
  // Attached to the synthetic [this.name] key in the form schema.
  private contactRequiredSchema: Joi.Schema;

  constructor(def: InputFieldsComponentsDef, model: FormModel) {
    super(def, model);

    this.children = new ComponentCollection(
      [
        {
          name: "mobile_number",
          options: {
            required: false,
            optionalText: false,
            customValidationMessages: {
              "string.pattern.base":
                "Enter a mobile number in the correct format",
            },
          },
          type: "TelephoneNumberField",
          title: "Mobile number",
          hint: "For example, 07700 900999",
          schema: {
            regex:
              "^(((\\+44\\s?\\d{4}|\\(?0\\d{4}\\)?)\\s?\\d{3}\\s?\\d{3})|((\\+44\\s?\\d{3}|\\(?0\\d{3}\\)?)\\s?\\d{3}\\s?\\d{4})|((\\+44\\s?\\d{2}|\\(?0\\d{2}\\)?)\\s?\\d{4}\\s?\\d{4}))(\\s?#(\\d{4}|\\d{3}))?$",
          },
        },
        {
          name: "landline_number",
          options: { required: false, optionalText: false },
          type: "TelephoneNumberField",
          title: "Landline number",
          hint: "For example, 020 7123 4567",
          schema: {
            regex: "^0([1-6][\\s\\d]{8,12})$",
          },
        },
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
        // Hidden carrier field for the "at least one" cross-field rule.
        // attaches the custom validator to this name, and Joi only runs
        // validators on keys present in the payload. Removing this field
        // silently disables the cross-field check.
        {
          type: "TextField",
          name: this.name,
          title: "Contact details",
          schema: {},
          options: {
            classes: "govuk-!-display-none",
            hideTitle: true,
            disableChangingFromSummary: true,
            allowPrePopulationOverwrite: true,
            required: false,
          },
        },
      ] as any,
      model
    );

    // State schema (Pass 2) — shape only
    this.stateSchema = Joi.object({
      mobile_number: Joi.string().empty(["", null]),
      email_address: Joi.string().empty(["", null]).email(),
    });

    // Cross-field rule enforcing "at least one of mobile/email" when the component is required.
    // Injected as callback on the synthetic [this.name] key in getFormSchemaKeys.
    this.contactRequiredSchema = Joi.any()
      .custom((value, helpers) => {
        const root = helpers.state.ancestors[0] as any;
        const hasMobile =
          root?.mobile_number && String(root.mobile_number).trim() !== "";
        const hasEmail =
          root?.email_address && String(root.email_address).trim() !== "";
        if (!hasMobile && !hasEmail) {
          return helpers.error("any.invalid");
        }
        return value;
      })
      .messages({
        "any.invalid":
          (this.options as any)?.customValidationMessages?.["any.required"] ??
          "Enter a mobile number or email address so we can contact you",
      });
  }

  getFormSchemaKeys() {
    // Inherit child keys, then add the synthetic key for the cross-field rule.
    const childrenKeys = this.children.getFormSchemaKeys();
    const isRequired = (this.options as any)?.required !== false;

    if (!isRequired) return childrenKeys;

    return {
      ...childrenKeys,
      [this.name]: this.contactRequiredSchema,
    };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.stateSchema as Schema };
  }

  getFormDataFromState(state: FormSubmissionState) {
    const value = state[this.name] ?? {};
    return {
      mobile_number: value.mobile_number ?? "",
      email_address: value.email_address ?? "",
    };
  }

  getStateValueFromValidForm(payload: FormPayload) {
    return {
      mobile_number: payload["mobile_number"] || null,
      email_address: payload["email_address"] || null,
    };
  }

  getDisplayStringFromState(state: FormSubmissionState) {
    const value = state[this.name];
    if (!value) return "";
    return [value.mobile_number, value.email_address]
      .filter(Boolean)
      .join(", ");
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const viewModel = super.getViewModel(formData, errors);

    // Filter out error from hidden field
    const childErrors: FormSubmissionErrors | undefined = errors
      ? {
          ...errors,
          errorList:
            errors.errorList?.filter((e) => e.name !== this.name) ?? [],
        }
      : errors;

    const componentViewModels = this.children
      .getViewModel(formData, childErrors)
      .map((vm) => vm.model);

    componentViewModels.forEach((cvm: any) => {
      if (cvm.errorMessage) {
        cvm.classes = `${cvm.classes ?? ""} govuk-input--error`.trim();
      }
    });

    return {
      ...viewModel,
      fieldset: { legend: viewModel.label },
      items: (componentViewModels as unknown) as ListItem[],
    };
  }
}
