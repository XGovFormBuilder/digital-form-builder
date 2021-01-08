import { isEmpty } from "./helpers";

export function hasValidationErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function validateNotEmpty(
  id: string,
  fieldName: string,
  key: string,
  value: string,
  existingErrors = {}
) {
  const hasErrors = isEmpty(value);
  const errors = existingErrors;

  if (hasErrors) {
    errors[key] = {
      href: `#${id}`,
      children: [`Enter ${fieldName}`],
    };
  }
  return errors;
}

export function validateName(
  id: string,
  fieldName: string,
  value: string,
  i18n: any
) {
  const namesIsEmpty = isEmpty(value);
  const nameHasErrors = /\s/g.test(value);
  const errors: any = {};
  if (nameHasErrors) {
    const message = i18n
      ? i18n("name.errors.whitespace")
      : "Name must not contain spaces";
    errors.name = {
      href: `#${id}`,
      children: [message],
    };
  } else if (namesIsEmpty) {
    const message = i18n
      ? i18n("errors.field", { field: fieldName })
      : "Enter Name";
    errors.name = {
      href: `#${id}`,
      children: [message],
    };
  }
  return errors;
}

export function validateTitle(id: string, value: string, i18n: any) {
  const titleHasErrors = isEmpty(value);
  const errors: any = {};
  if (titleHasErrors) {
    const message = i18n
      ? i18n("errors.field", { field: "$t(title)" })
      : "Enter title";

    errors.title = {
      href: `#${id}`,
      children: [message],
    };
  }
  return errors;
}
