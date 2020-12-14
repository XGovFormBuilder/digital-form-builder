import { validateNotEmpty } from "../../validations";
import { isEmpty } from "../../helpers";
import { ComponentTypeEnum as Types } from "@xgovformbuilder/model";

function validateDetails(component) {
  const { title, content } = component;
  return {
    ...validateNotEmpty("details-title", "Title", "title", title),
    ...validateNotEmpty("details-content", "Content", "content", content),
  };
}

function validateTitle(id, value) {
  const titleHasErrors = isEmpty(value);
  if (titleHasErrors) {
    return {
      title: {
        href: `#${id}`,
        children: ["errors.field", { field: "$t(title)" }],
      },
    };
  }
}

export interface ValidationError {
  href?: string;
  children: string | [string, Record<string, string>];
}

const validateName = (name) => {
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

export function fieldComponentValidations(component) {
  const validations = [
    validateName(component.name),
    validateTitle("field-title", component.title),
  ];

  switch (component.type) {
    case Types.CheckboxesField:
    case Types.DateField:
    case Types.DateTimeField:
    case Types.DateTimePartsField:
    case Types.EmailAddressField:
    case Types.FileUploadField:
    case Types.MultilineTextField:
    case Types.NumberField:
    case Types.TextField:
    case Types.TelephoneNumberField:
    case Types.TimeField:
    case Types.UkAddressField:
      break;

    case Types.InsetText:
    case Types.Html:
    case Types.Para:
      //validate content types
      break;

    case Types.Details:
      validations.push(validateDetails(component));
      break;

    case Types.AutocompleteField:
    case Types.List:
    case Types.RadiosField:
    case Types.SelectField:
    case Types.YesNoField:
    case Types.FlashCard:
      //validate list types
      break;
  }

  return validations.reduce((acc, error: ValidationError) => {
    return !!error ? { ...acc, ...error } : acc;
  }, {});
}

export function validateComponent(selectedComponent) {
  return {
    errors: fieldComponentValidations(selectedComponent),
  };
}
