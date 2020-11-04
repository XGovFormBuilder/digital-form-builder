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

export type AutocompleteFieldComponent = {
  type: "AutocompleteField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
  };
  values: ComponentValues;
};

export type CheckboxesFieldComponent = {
  type: "CheckboxesField";
  name: string;
  options: {
    bold?: boolean;
  };
  values: ComponentValues;
};

export type DateFieldComponent = {
  type: "DateField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {
    //TODO
  };
};

export type DateTimeFieldComponent = {
  type: "DateTimeField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {
    //TODO
  };
};

export type DateTimePartsFieldComponent = {
  type: "DateTimePartsField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {
    //TODO
  };
};

export type DetailsComponent = {
  type: "Details";
  name: string;
  title: string;
  content: string;
  options: {
    //TODO
  };
  schema: {
    //TODO
  };
};

export type EmailAddressFieldComponent = {
  type: "EmailAddressField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
  };
  schema: {
    max?: number;
    min?: number;
    length?: number;
    regex?: string;
  };
};

export type FileUploadFieldComponent = {
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
  schema: {
    //TODO
  };
};

export type FlashCardComponent = {
  type: "FlashCard";
  name: string;
  values: ComponentValues;
  options: {
    // TODO
  };
  schema: {
    //TODO
  };
};

export type HtmlComponent = {
  type: "Html";
  name: string;
  options: {
    condition: string;
  };
  schema: {
    //TODO
  };
};

export type InsetTextComponent = {
  type: "InsetText";
  name: string;
  content: string;
  options: {
    // TODO
    condition?: string;
  };
  schema: {
    // TODO
  };
};

export type ListComponent = {
  type: "List";
  name: string;
  options: {
    type: "numbered";
  };
  values: ComponentValues;
  schema: {
    //TODO
  };
};

export type MultilineTextFieldComponent = {
  type: "MultilineTextField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle: boolean;
    required: boolean;
    optionalText: boolean;
    rows: number;
    classes: string;
  };
  schema: {
    max: number;
    min: number;
  };
};

export type NumberFieldComponent = {
  type: "NumberField";
  name: string;
  title: string;
  hint: string;
  schema: {
    min: number;
    max: number;
    precision: number;
  };
};

export type ParaComponent = {
  type: "Para";
  name: string;
  options: {
    condition: string;
  };
  content: string;
  schema: {
    //TODO
  };
};

export type RadiosFieldComponent = {
  type: "RadiosField";
  name: string;
  values: ComponentValues;
  options: {
    bold: boolean;
  };
  schema: {
    //TODO
  };
};

export type SelectFieldComponent = {
  type: "SelectField";
  name: string;
  options: { classes: string };
  values: ComponentValues;
  schema: {
    //TODO
  };
};

export type TelephoneNumberFieldComponent = {
  type: "TelephoneNumberField";
  name: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
  };
  schema: {
    max?: number;
    min?: number;
    length?: number;
    regex?: string;
  };
};

export type TextFieldComponent = {
  type: "TextField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
    classes?: string;
    allow?: string; // TODO double check
  };
  schema: {
    max?: number;
    min?: number;
    length?: number;
    regex?: string;
    error?: any; // TODO: in same cases this is a function e.g. addressLine1 in ukaddress
  };
};

export type TimeFieldComponent = {
  type: "TimeField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {
    //TODO
  };
};

export type UkAddressFieldComponent = {
  type: "UkAddressField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {
    //TODO
  };
};

export type YesNoFieldComponent = {
  type: "YesNoField";
  name: string;
  title: string;
  hint: string;
  options: {
    hideTitle?: boolean;
    required?: boolean;
    optionalText?: boolean;
  };
  schema: {
    //TODO
  };
};

export type Component =
  | InsetTextComponent
  | AutocompleteFieldComponent
  | CheckboxesFieldComponent
  | DateFieldComponent
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
