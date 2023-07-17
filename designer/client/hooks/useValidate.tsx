import { useState } from "react";

const defaultValidationOptions = {
  convert: true,
  abortEarly: false,
  errors: {
    wrap: {
      label: false,
    },
  },
};
export function useValidate() {
  const [errors, setErrors] = useState({});
  function validate(values, schema, validationOptions = {}) {
    const { error } = schema.validate(values, {
      ...defaultValidationOptions,
      validationOptions,
    });

    if (error) {
      const joiErrorAsEntries = error.details.map((detail) => [
        detail.context.label,
        detail.message,
      ]);
      const errors = Object.fromEntries(joiErrorAsEntries);
      setErrors(errors);
    }
  }

  return {
    errors,
    validate,
  };
}
