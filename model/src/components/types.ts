import { ComponentValues } from "../values";

export type ComponentType =
  | "TextField"
  | "MultilineTextField"
  | "YesNoField"
  | "DateField"
  | "TimeField"
  | "DateTimeField"
  | "DatePartsField"
  | "DateTimePartsField"
  | "SelectField"
  | "AutocompleteField"
  | "RadiosField"
  | "RadiosField"
  | "CheckboxesField"
  | "CheckboxesField"
  | "NumberField"
  | "UkAddressField"
  | "TelephoneNumberField"
  | "EmailAddressField"
  | "FileUploadField"
  | "Para"
  | "Html"
  | "InsetText"
  | "Details"
  | "FlashCard"
  | "List";

export type ComponentSubType = "field" | "content";

export type ConditionalComponent = {
  name: "TextField" | "NumberField";
  title: string;
  subType: "field";
};

// Types for Components JSON structure which are expected by engine and turned into
// actual form input/content/lists
interface TextFieldBase {
  subType?: "field";
  type: string;
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
    allow?: string;
  };
  schema: {
    max?: number;
    min?: number;
    length?: number;
    regex?: string;
    error?: any; // TODO: in same cases this is a function e.g. addressLine1 in ukaddress
  };
}

interface NumberFieldBase {
  subType?: "field";
  type: string;
  name: string;
  title: string;
  hint: string;
  options: {};
  schema: {
    min?: number;
    max?: number;
    precision?: number;
  };
}

interface ListFieldBase {
  subType?: "field" | "content";
  type: string;
  name: string;
  title: string;
  options: {
    type?: string;
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
    bold?: boolean;
  };
  values?: ComponentValues;
  schema: {};
}

interface ContentFieldBase {
  subType?: "content";
  type: string;
  name: string;
  title: string;
  content: string;
  options: {
    condition?: string;
  };
  schema: {};
}

interface DateFieldBase {
  subType?: "field";
  type: string;
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {};
}

// Text Fields
export interface TextFieldComponent extends TextFieldBase {
  type: "TextField";
}

export interface EmailAddressFieldComponent extends TextFieldBase {
  type: "EmailAddressField";
}

export interface NumberFieldComponent extends NumberFieldBase {
  type: "NumberField";
}

export interface MultilineTextFieldComponent {
  type: "MultilineTextField";
}

export interface TelephoneNumberFieldComponent extends TextFieldBase {
  type: "TelephoneNumberField";
}

export interface YesNoFieldComponent extends TextFieldBase {
  type: "YesNoField";
}

export interface MultilineTextFieldComponent {
  subType?: "field";
  type: "MultilineTextField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    rows?: number;
    classes?: string;
  };
  schema: {
    max?: number;
    min?: number;
  };
}

export interface FileUploadFieldComponent {
  subType?: "field";
  type: "FileUploadField";
  name: string;
  title: string;
  hint: string;
  options: {
    required?: boolean;
    hideTitle?: boolean;
    multiple?: boolean;
    classes?: string;
  };
  schema: {};
}

// Date Fields
export interface DateFieldComponent extends DateFieldBase {
  type: "DateField";
}

export interface DateTimeFieldComponent extends DateFieldBase {
  type: "DateTimeField";
}

export interface DatePartsFieldFieldComponent extends DateFieldBase {
  type: "DatePartsField";
}

export interface DateTimePartsFieldComponent extends DateFieldBase {
  type: "DateTimePartsField";
}

export interface TimeFieldComponent extends DateFieldBase {
  type: "TimeField";
}

// Content Fields
export interface ParaComponent extends ContentFieldBase {
  type: "Para";
}

export interface DetailsComponent extends ContentFieldBase {
  type: "Details";
}

export interface HtmlComponent extends ContentFieldBase {
  type: "Html";
}

export interface InsetTextComponent extends ContentFieldBase {
  type: "InsetText";
}

export interface UkAddressFieldComponent extends TextFieldBase {
  type: "UkAddressField";
}

// List Fields
export interface ListComponent extends ListFieldBase {
  type: "List";
}

export interface AutocompleteFieldComponent extends ListFieldBase {
  type: "AutocompleteField";
}

export interface CheckboxesFieldComponent extends ListFieldBase {
  type: "CheckboxesField";
}

export interface FlashCardComponent extends ListFieldBase {
  type: "FlashCard";
}

export interface RadiosFieldComponent extends ListFieldBase {
  type: "RadiosField";
}

export interface SelectFieldComponent extends ListFieldBase {
  type: "SelectField";
}

export type Component =
  | InsetTextComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | DateFieldComponent
  | DatePartsFieldFieldComponent
  | DateTimeFieldComponent
  | DateTimePartsFieldComponent
  | DetailsComponent
  | EmailAddressFieldComponent
  | FileUploadFieldComponent
  | FlashCardComponent
  | HtmlComponent
  | ListComponent
  | MultilineTextFieldComponent
  | NumberFieldComponent
  | ParaComponent
  | RadiosFieldComponent
  | SelectFieldComponent
  | TelephoneNumberFieldComponent
  | TextFieldComponent
  | TimeFieldComponent
  | UkAddressFieldComponent
  | YesNoFieldComponent;

// Components that render inputs.
export type InputFieldsComponents =
  | TextFieldComponent
  | EmailAddressFieldComponent
  | NumberFieldComponent
  | MultilineTextFieldComponent
  | TelephoneNumberFieldComponent
  | YesNoFieldComponent
  | MultilineTextFieldComponent
  | FileUploadFieldComponent
  | DateFieldComponent
  | DateTimeFieldComponent
  | DateTimePartsFieldComponent
  | TimeFieldComponent;

// Components that render content.
export type ContentComponents =
  | ParaComponent
  | DetailsComponent
  | HtmlComponent
  | InsetTextComponent
  | UkAddressFieldComponent;

// Components that render Lists
export type ListComponents =
  | ListComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | FlashCardComponent
  | RadiosFieldComponent
  | SelectFieldComponent;
