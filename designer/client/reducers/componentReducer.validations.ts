import { validateNotEmpty, validateTitle } from "../validations";
import { isEmpty } from "../helpers";
import type {
  inputFieldsDef,
  ContentComponentsDef,
  ListComponentsDef,
} from "@xgovformbuilder/model/components";
import { i18n } from "../i18n";
function validateDetails(component) {
  const { title, content } = component;
  return {
    ...validateNotEmpty("details-title", "Title", "title", title),
    ...validateNotEmpty("details-content", "Content", "content", content),
  };
}

function validateComponent(component) {
  const errors = {
    ...validateNotEmpty("details-title", "Title", "title", component.title),
    ...validateNotEmpty(
      "details-content",
      "Content",
      "content",
      component.title
    ),
  };
}

const validateName = (name) => {
  //TODO:- should also validate uniqueness.
  const errors: any = {};
  const nameIsEmpty = isEmpty(name);
  const nameHasSpace = /\s/g.test(name);
  if (nameHasSpace) {
    errors.name = {
      href: `#field-name`,
      children: i18n("name.errors.whitespace"),
    };
  } else if (nameIsEmpty) {
    errors.name = {
      href: `#field-name`,
      children: i18n("errors.field", { field: "Component name" }),
    };
  }
  return errors;
};

const componentIsSubtype = <Subtype>(component: any): component is Subtype => {
  return (component as Subtype).type !== undefined;
};

function fieldComponentValidations(component) {
  const validations = [
    validateName(component.name),
    validateTitle("field-title", component.title),
  ];

  if (componentIsSubtype<ContentComponentsDef>(component)) {
    validations.push(validateDetails(component));
  }

  if (componentIsSubtype<inputFieldsDef>(component)) {
    //validate
  }
  if (componentIsSubtype<ListComponentsDef>(component)) {
    //validate
  }

  return { ...validations };
}

export function errorReducer(state) {
  const { selectedComponent } = state;
  return {
    ...state,
    selectedComponent: {
      ...selectedComponent,
      errors: fieldComponentValidations(selectedComponent),
    },
  };
}
