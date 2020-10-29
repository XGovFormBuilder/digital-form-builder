import { ValuesType } from "../values/types";
import { ConcreteValueTypes } from "../values/types";
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

export type Component = {
  name: string;
  title: string;
  type: ComponentType;
  subType?: ComponentSubType;
  options?: {
    classes?: string;
    hideTitle?: boolean;
    optionalText?: boolean;
    required?: boolean;
    bold?: boolean;
    multiple?: boolean; // when FileUploadField
    condition?: String; // the ID of the condition stored in dataModel.conditions
    rows?: string; // when MultilineTextField
  };
  schema?: {
    length?: string;
    max?: string;
    min?: string;
    regex?: string;
  };
  content?: string; // e.g: paragraphs have content
  values?: ComponentValues;
};
