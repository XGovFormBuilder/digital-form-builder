import { ValidationError, ValidationErrorItem } from "joi";

/**
 * Converts an array of joi validation errors to be passed into the view.
 */
export function errorListFromValidationResult(
  validationError: ValidationError[]
) {
  if (validationError.length === 0) {
    return null;
  }

  if (!validationError[0].details) {
    return null;
  }

  const errors = validationError[0];

  const errorList = errors.details.map(errorListItemToErrorVM);

  return {
    titleText: "There is a problem",
    errorList: errorList.filter(
      ({ text }, index) =>
        index === errorList.findIndex((err) => err.text === text)
    ),
  };
}

/**
 * Converts a single validation error to the error VM.
 */
export function errorListItemToErrorVM(error: ValidationErrorItem) {
  const name = error.path
    .map((name: string, index: number) => (index > 0 ? `__${name}` : name))
    .join("");

  return {
    path: error.path.join("."),
    href: `#${name}`,
    name: name,
    text: error.message,
  };
}
