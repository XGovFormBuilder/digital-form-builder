export enum ComponentTypeEnum {
  TextField = "TextField",
  MultilineTextField = "MultilineTextField",
  YesNoField = "YesNoField",
  DateField = "DateField",
  TimeField = "TimeField",
  DateTimeField = "DateTimeField",
  DatePartsField = "DatePartsField",
  ContactDetailsCollection = "ContactDetailsCollection",
  Fieldset = "Fieldset",
  MonthYearField = "MonthYearField",
  DateTimePartsField = "DateTimePartsField",
  SelectField = "SelectField",
  AutocompleteField = "AutocompleteField",
  RadiosField = "RadiosField",
  ConditionalRadiosField = "ConditionalRadiosField",
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
  DisplayAddress = "DisplayAddress",
  HiddenField = "HiddenField",
  SummaryLists = "SummaryLists",
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
  | "ContactDetailsCollection"
  | "Fieldset"
  | "DateTimePartsField"
  | "SelectField"
  | "AutocompleteField"
  | "RadiosField"
  | "ConditionalRadiosField"
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
  | "ContentWithState"
  | "DisplayAddress"
  | "HiddenField"
  | "SummaryLists";

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
    format?: {
      trim?: boolean;
      case?: "upper" | "lower";
    };
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
    isInternationalOnly?: boolean;
    isUKOnly?: boolean;
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

export interface FieldsetComponent {
  type: "Fieldset";
  subType?: "field";
  name: string;
  title: string;
  hint?: string;
  components: ComponentDef[];
  options: {
    required: false;
    optionalText: false;
    hideTitle?: boolean;
    classes?: string;
    condition?: string;
    exposeToContext?: boolean;
    validation?: FieldsetValidationRule[];
  };
  schema?: {};
}

type FieldsetValidationRule = MinimumRequired;

interface MinimumRequired {
  minRequired: number;
  fields: string[];
  errorMessage: string;
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
export interface ContactDetailsCollectionComponent extends DateFieldBase {
  type: "ContactDetailsCollection";
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

export interface DisplayAddressComponent extends ContentFieldBase {
  type: "DisplayAddress";
}

export interface HiddenFieldComponent {
  type: "HiddenField";
  name: string;
  options: {
    value?: string;
    exposeToContext?: boolean;
  };
  schema?: {};
}

export interface ConditionalValue {
  condition?: string;
  value: string;
}

export interface SummaryListComponentValue {
  name: string;
  type: string;
  content: string | ConditionalValue[];
  options?: Record<string, any>;
}

export interface SummaryListRow {
  title: string;
  value: string | SummaryListComponentValue;
  changeUrl: string | false | ConditionalValue[];
  type?: "component";
}

export interface SummaryListSection {
  title: string;
  content: SummaryListRow[];
}

export interface SummaryListsComponent {
  type: "SummaryLists";
  name: string;
  title?: string;
  content: SummaryListSection[];
  subType?: "content";
  options: {
    enableCards?: boolean | "true" | "false";
    condition?: string;
  };
  schema?: {};
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

export interface ConditionalRadiosFieldComponent extends ListFieldBase {
  type: "ConditionalRadiosField";
  subType?: "listField";
}

export interface SelectFieldComponent extends ListFieldBase {
  type: "SelectField";
  options: ListFieldBase["options"] & { autocomplete?: string } & {
    preselected?: { text: string; value: string | number | boolean };
  };
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
  | ContactDetailsCollectionComponent
  | FieldsetComponent
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
  | ConditionalRadiosFieldComponent
  | SelectFieldComponent
  | TelephoneNumberFieldComponent
  | TextFieldComponent
  | TimeFieldComponent
  | UkAddressFieldComponent
  | YesNoFieldComponent
  | WebsiteFieldComponent
  | ContextComponent
  | ContentWithStateComponent
  | DisplayAddressComponent
  | HiddenFieldComponent
  | SummaryListsComponent;

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
  | ContentWithStateComponent
  | DisplayAddressComponent;

// Components that render Lists
export type ListComponentsDef =
  | ListComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | FlashCardComponent
  | RadiosFieldComponent
  | ConditionalRadiosFieldComponent
  | SelectFieldComponent;
