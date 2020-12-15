import { isEmpty } from "./helpers";

export function hasValidationErrors(errors) {
  if (errors) return Object.keys(errors).length > 0;
  return false;
}

export function validateNotEmpty(id, fieldName, key, value, existingErrors) {
  const hasErrors = isEmpty(value);
  const errors = existingErrors ? existingErrors : {};
  if (hasErrors) {
    errors[key] = {
      href: `#${id}`,
      children: [`Enter ${fieldName}`],
    };
  }
  return errors;
}

export function validateName(id, fieldName, value, i18n) {
  const namesIsEmpty = isEmpty(value);
  const nameHasErrors = /\s/g.test(value);
  const errors = {};
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

export function validateTitle(id, value, i18n) {
  const titleHasErrors = isEmpty(value);
  const errors = {};
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
