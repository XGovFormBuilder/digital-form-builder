import { useState } from "react";

export const useRequiredInput = (val) => {
  const [fieldValue, setFieldValue] = useState(val);
  const [hasError, setHasError] = useState(false);

  function handleFieldChange(e) {
    const { value } = e.target;
    setHasError(/\s/g.test(value));
    setFieldValue(value);
  }

  return { fieldValue, hasError, handleFieldChange };
};
