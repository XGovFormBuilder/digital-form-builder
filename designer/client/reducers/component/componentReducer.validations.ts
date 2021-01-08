import { validateNotEmpty, validateTitle } from "../../validations";
import { isEmpty } from "../../helpers";
import { ComponentTypeEnum as Types } from "@xgovformbuilder/model";
import { i18n } from "../../i18n";

export interface ValidationError {
  href?: string;
  children: string | [string, Record<string, string>];
}

function validateDetails(component) {
  const { title, content } = component;
  return {
    ...validateNotEmpty("details-title", "Title", "title", title),
    ...validateNotEmpty("details-content", "Content", "content", content),
  };
}

const validateName = (name: string) => {
  //TODO:- should also validate uniqueness.
  const errors: any = {};
  const nameIsEmpty = isEmpty(name);
  const nameHasSpace = /\s/g.test(name);
  if (nameHasSpace) {
    errors.name = {
      href: `#field-name`,
      children: ["name.errors.whitespace"],
    };
  } else if (nameIsEmpty) {
    errors.name = {
      href: `#field-name`,
      children: ["errors.field", { field: "Component name" }],
    };
  }

  return errors;
};

const validateContent = (content: string) => {
  const errors: any = {};
  const contentIsEmpty = isEmpty(content);

  if (contentIsEmpty) {
    errors.name = {
      href: `#field-content`,
      children: ["errors.field", { field: "Content" }],
    };
  }

  return errors;
};

const validateList = (list) => {};

const ComponentsWithoutTitleField = [Types.InsetText, Types.Html, Types.Para];
const ComponentsWithContentField = [Types.InsetText, Types.Html, Types.Para];
const ComponentsWithDetailsField = [Types.Details];
const ComponentsWithListField = [
  Types.AutocompleteField,
  Types.List,
  Types.RadiosField,
  Types.SelectField,
  Types.YesNoField,
  Types.FlashCard,
];

export function fieldComponentValidations(component) {
  const hasTitle = !ComponentsWithoutTitleField.includes(component.type);
  const hasContentField = ComponentsWithContentField.includes(component.type);
  const hasDetailsField = ComponentsWithDetailsField.includes(component.type);
  const hasListField = ComponentsWithListField.includes(component.type);

  console.log("XXXX", component);

  const validations = [validateName(component.name)];

  if (hasTitle) {
    validations.push(validateTitle("field-title", component.title, i18n));
  }

  if (hasContentField) {
    validations.push(validateContent(component.content));
  }

  if (hasDetailsField) {
    validations.push(validateDetails(component.details));
  }

  if (hasListField) {
    validations.push(validateList(component.list));
  }

  console.log({
    component,
    type: component.type,
    validations,
  });

  const errors = validations.reduce((acc, error: ValidationError) => {
    return !!error ? { ...acc, ...error } : acc;
  }, {});

  console.log({ errors });
  return errors;
}

export function validateComponent(selectedComponent) {
  return {
    errors: fieldComponentValidations(selectedComponent),
  };
}
