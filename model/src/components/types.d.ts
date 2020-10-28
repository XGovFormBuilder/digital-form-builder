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

export type Component = {
  name: string;
  title: string;
  type: ComponentType;
  subType: ComponentSubType;
  options?: { [prop: string]: string };
  schema?: { [prop: string]: string };
  content?: string;
};

export type ConditionalComponent = {
  name: "TextField" | "NumberField";
  title: string;
  subType: "field";
};
