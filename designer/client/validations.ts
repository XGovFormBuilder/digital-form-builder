import { isEmpty } from "./helpers";
import { i18n } from "./i18n";

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;

}

export function hasRepeatingFieldErrors(errors) {
  const arr = [];
  errors?.map((errors, index) => {
    const title = errors?.title;
    const value = errors?.value;
    if ((title === undefined && value === undefined) || errors === {})
      arr.push(index);
  });

  if (arr.length !== 0)
    errors?.splice(arr.forEach(ele => ele), arr.length);

  return Object.keys(errors).length > 0;
}

export function validateRows(items: any[],
  i18nProp?: any) {
  const repeatingFieldErrors: any = [];
  let errors: any = {};
  items?.map((item, id) => {
    const title = item.title;
    const value = item.value;

    repeatingFieldErrors.push({});

    errors = validateTitle("page-title-".concat(id.toString()), title, i18nProp);
    repeatingFieldErrors[id].title = errors.title;
    errors = validateValue("page-value-".concat(id.toString()), value, i18nProp);
    repeatingFieldErrors[id].value = errors.value;

    errors = {};
  });

  return repeatingFieldErrors;
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
      children: [i18n("errors.field", { field: fieldName })],
    };
  }
  return errors;
}

export function validateName(
  id: string,
  fieldName: string,
  value: string,
  i18nProp?: any
) {
  const translate = i18nProp ?? i18n;
  const namesIsEmpty = isEmpty(value);
  const nameHasErrors = /\s/g.test(value);
  const errors: any = {};
  if (nameHasErrors) {
    const message = translate
      ? translate("name.errors.whitespace")
      : "Name must not contain spaces";
    errors.name = {
      href: `#${id}`,
      children: [message],
    };
  } else if (namesIsEmpty) {
    const message = translate
      ? translate("errors.field", { field: fieldName })
      : "Enter Name";
    errors.name = {
      href: `#${id}`,
      children: [message],
    };
  }
  return errors;
}

export function validateTitle(id: string, value: string, i18nProp?: any) {
  const translate = i18nProp ?? i18n;
  const titleHasErrors = isEmpty(value);
  const errors: any = {};
  if (titleHasErrors) {
    const message = translate
      ? translate("errors.field", { field: "$t(title)" })
      : "Enter title";

    errors.title = {
      href: `#${id}`,
      children: [message],
    };
  }
  return errors;
}

export function validateValue(id: string, value: string, i18nProp?: any) {
  const translate = i18nProp ?? i18n;
  const valueHasErrors = isEmpty(value);
  const errors: any = {};
  if (valueHasErrors) {
    const message = translate
      ? translate("errors.field", { field: "$t(value)" })
      : "Enter value";

    errors.value = {
      href: `#${id}`,
      children: [message],
    };
  }
  return errors;
}
