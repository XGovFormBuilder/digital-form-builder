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
  ContextComponent = "ContextComponent",
  ContentWithState = "ContentWithState",
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
  | "ContextComponent"
  | "ContentWithState";

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
    exposeToContext?: boolean;
    disableChangingFromSummary?: boolean;
    customValidationMessages?: Record<string, string>;
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
    exposeToContext?: boolean;
    disableChangingFromSummary?: boolean;
    customValidationMessages?: Record<string, string>;
  };
  schema: {
    min?: number;
    max?: number;
    precision?: number;
    integer?: boolean;
  };
}

interface ListFieldBase {
  subType?: "listField" | "content";
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
    exposeToContext?: boolean;
    allowPrePopulation?: boolean;
    allowPrePopulationOverwrite?: boolean;
    disableChangingFromSummary?: boolean;
    customValidationMessages?: Record<string, string>;
    summaryTitle?: string;
    divider?: boolean;
    finalValue?: string;
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
    exposeToContext?: boolean;
    disableChangingFromSummary?: boolean;
    customValidationMessages?: Record<string, string>;
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
  options: TextFieldBase["options"] & {
    customValidationMessage?: string;
  };
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
    isInternational?: boolean;
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
    exposeToContext?: boolean;
    imageQualityPlayback?: boolean;
    disableChangingFromSummary?: boolean;
    accept?: string;
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

export interface ContentWithStateComponent extends ContentFieldBase {
  type: "ContentWithState";
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
  subType?: "listField";
}

export interface CheckboxesFieldComponent extends ListFieldBase {
  type: "CheckboxesField";
  subType?: "listField";
}

export interface FlashCardComponent extends ListFieldBase {
  type: "FlashCard";
}

export interface RadiosFieldComponent extends ListFieldBase {
  type: "RadiosField";
  subType?: "listField";
}

export interface SelectFieldComponent extends ListFieldBase {
  type: "SelectField";
  options: ListFieldBase["options"] & { autocomplete?: string };
  subType?: "listField";
}

export interface ContextComponent extends ListFieldBase {
  type: "ContextComponent";
  options: ListFieldBase["options"];
  section?: string;
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
  | ContextComponent
  | ContentWithStateComponent;

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
  | WebsiteFieldComponent;

// Components that render content.
export type ContentComponentsDef =
  | ParaComponent
  | DetailsComponent
  | HtmlComponent
  | InsetTextComponent
  | ListComponent
  | FlashCardComponent
  | ContentWithStateComponent;

// Components that render Lists
export type ListComponentsDef =
  | ListComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | FlashCardComponent
  | RadiosFieldComponent
  | SelectFieldComponent;
