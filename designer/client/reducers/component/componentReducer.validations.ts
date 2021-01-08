import { validateTitle } from "../../validations";
import { isEmpty } from "../../helpers";
import { ComponentTypeEnum as Types } from "@xgovformbuilder/model";
import { i18n } from "../../i18n";

export interface ValidationError {
  href?: string;
  children: string | [string, Record<string, string>];
}

// TODO move validations to "../../validations"
const validateName = ({ name }) => {
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

const validateContent = ({ content }) => {
  const errors: any = {};
  const contentIsEmpty = isEmpty(content);

  if (contentIsEmpty) {
    errors.content = {
      href: `#field-content`,
      children: ["errors.field", { field: "Content" }],
    };
  }

  return errors;
};

const validateList = (component) => {};

const ComponentsWithoutTitleField = [Types.InsetText, Types.Html, Types.Para];
const ComponentsWithContentField = [
  Types.InsetText,
  Types.Html,
  Types.Para,
  Types.Details,
];
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
  const hasListField = ComponentsWithListField.includes(component.type);

  const validations = [validateName(component)];

  if (hasTitle) {
    validations.push(validateTitle("field-title", component.title, i18n));
  }

  if (hasContentField) {
    validations.push(validateContent(component));
  }

  if (hasListField) {
    validations.push(validateList(component));
  }

  const errors = validations.reduce((acc, error: ValidationError) => {
    return !!error ? { ...acc, ...error } : acc;
  }, {});

  return errors;
}

export function validateComponent(selectedComponent) {
  return {
    errors: fieldComponentValidations(selectedComponent),
  };
}
