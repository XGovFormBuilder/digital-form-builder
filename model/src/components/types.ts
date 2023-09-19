export enum ComponentTypeEnum {
  TextField = "TextField",
  MultilineTextField = "MultilineTextField",
  YesNoField = "YesNoField",
  DateField = "DateField",
  TimeField = "TimeField",
  DateTimeField = "DateTimeField",
  DatePartsField = "DatePartsField",
  MonthYearField = "MonthYearField",
  DateTimePartsField = "DateTimePartsField",
  SelectField = "SelectField",
  AutocompleteField = "AutocompleteField",
  RadiosField = "RadiosField",
  CheckboxesField = "CheckboxesField",
  NumberField = "NumberField",
  UkAddressField = "UkAddressField",
  TelephoneNumberField = "TelephoneNumberField",
  EmailAddressField = "EmailAddressField",
  FileUploadField = "FileUploadField",
  Para = "Para",
  Html = "Html",
  InsetText = "InsetText",
  Details = "Details",
  FlashCard = "FlashCard",
  List = "List",
  MultiInputField = "MultiInputField",
}

export type ComponentType =
  | "TextField"
  | "MultilineTextField"
  | "YesNoField"
  | "DateField"
  | "TimeField"
  | "DateTimeField"
  | "MonthYearField"
  | "DatePartsField"
  | "DateTimePartsField"
  | "SelectField"
  | "AutocompleteField"
  | "RadiosField"
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
  | "List"
  | "WebsiteField"
  | "MultiInputField";

export type ComponentSubType = "field" | "content";

export type ConditionalComponent = {
  name: "TextField" | "NumberField";
  title: string;
  subType: "field";
};

export type ContentOptions = {
  condition?: string;
};

/**
 * Types for Components JSON structure which are expected by engine and turned into actual form input/content/lists
 */
interface TextFieldBase {
  subType?: "field";
  type: string;
  name: string;
  title: string;
  hint?: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
    allow?: string;
    autocomplete?: string;
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
  options: {
    prefix?: string;
    suffix?: string;
  };
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
  list: string;
  schema: {};
}

interface ContentFieldBase {
  subType?: "content";
  type: string;
  name: string;
  title: string;
  content: string;
  options: ContentOptions;
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
    maxDaysInFuture?: number;
    maxDaysInPast?: number;
  };
  schema: {};
}

// Text Fields
export interface TextFieldComponent extends TextFieldBase {
  type: "TextField";
  options: TextFieldBase["options"] & {
    customValidationMessage?: string;
  };
}

export interface EmailAddressFieldComponent extends TextFieldBase {
  type: "EmailAddressField";
}

export interface NumberFieldComponent extends NumberFieldBase {
  type: "NumberField";
}

export interface WebsiteFieldComponent extends TextFieldBase {
  type: "WebsiteField";
  options: TextFieldBase["options"] & {
    customValidationMessage?: string;
  };
}

export interface MultilineTextFieldComponent {
  type: "MultilineTextField";
}

export interface TelephoneNumberFieldComponent extends TextFieldBase {
  type: "TelephoneNumberField";
  options: TextFieldBase["options"] & {
    customValidationMessage?: string;
  };
}

export interface YesNoFieldComponent extends TextFieldBase {
  type: "YesNoField";
}

export interface MultilineTextFieldComponent extends TextFieldBase {
  type: "MultilineTextField";
  options: TextFieldBase["options"] & {
    customValidationMessage?: string;
    rows?: number;
    maxWords?: number;
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

export interface UkAddressFieldComponent extends TextFieldBase {
  type: "UkAddressField";
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

export interface MonthYearFieldComponent extends DateFieldBase {
  type: "MonthYearField";
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
  options: ListFieldBase["options"] & { autocomplete?: string };
}

export interface MultiInputFieldComponent extends TextFieldBase {
  type: "MultiInputField";
  options: TextFieldBase["options"] & {
    textFieldTitle?: string;
    numberFieldTitle?: string;
  };
}

export type ComponentDef =
  | InsetTextComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | DateFieldComponent
  | DatePartsFieldFieldComponent
  | MonthYearFieldComponent
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
  | YesNoFieldComponent
  | WebsiteFieldComponent
  | MultiInputFieldComponent;

// Components that render inputs.
export type InputFieldsComponentsDef =
  | TextFieldComponent
  | EmailAddressFieldComponent
  | NumberFieldComponent
  | MultilineTextFieldComponent
  | TelephoneNumberFieldComponent
  | YesNoFieldComponent
  | FileUploadFieldComponent
  | DateFieldComponent
  | DateTimeFieldComponent
  | DateTimePartsFieldComponent
  | MonthYearFieldComponent
  | TimeFieldComponent
  | UkAddressFieldComponent
  | WebsiteFieldComponent
  | MultiInputFieldComponent;

// Components that render content.
export type ContentComponentsDef =
  | ParaComponent
  | DetailsComponent
  | HtmlComponent
  | InsetTextComponent
  | ListComponent
  | FlashCardComponent;

// Components that render Lists
export type ListComponentsDef =
  | ListComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | FlashCardComponent
  | RadiosFieldComponent
  | SelectFieldComponent;
