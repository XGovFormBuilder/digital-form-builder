import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context";
import { useFormInput } from "../../hooks/useFormInput";
import { Input } from "@govuk-jsx/input";
import ErrorSummary from "../../error-summary";
import { useValidate } from "../../hooks/useValidate";
import joi from "joi";

const schema = joi.object({
  prodApiKey: joi.string(),
  // prodApiKey: joi.string().optional().trim().allow(""),
  testApiKey: joi.string().optional().trim().allow(""),
  paymentReferenceFormat: joi.string().optional().trim().allow(""),
  payReturnUrl: joi.string().optional().trim().allow(""),
  t: joi.string(),
  p: joi.string(),
});

export function FeeOptions() {
  const { data, save } = useContext(DataContext);
  const { feeOptions } = data;

  const prodApiKey = useFormInput(
    feeOptions.payApiKey?.production ?? feeOptions.payApiKey ?? ""
  );
  const testApiKey = useFormInput(
    feeOptions.payApiKey?.test ?? feeOptions.payApiKey ?? ""
  );

  const paymentReferenceFormat = useFormInput(
    feeOptions.paymentReferenceFormat
  );

  const [errorList, setErrorList] = useState([]);

  const payReturnUrl = useFormInput(feeOptions.payReturnUrl);
  const { errors = {}, validate } = useValidate();

  useEffect(() => {
    const errorsAsList = Object.entries(errors).map(([key, value]) => ({
      reactListKey: key,
      href: `#${key}`,
      children: value,
    }));
    setErrorList(errorsAsList);
  }, [errors]);

  function submit(e) {
    e.preventDefault();
    validate(
      {
        prodApiKey: prodApiKey.value,
        testApiKey: testApiKey.value,
        paymentReferenceFormat: paymentReferenceFormat.value,
        payReturnUrl: payReturnUrl.value,
        t: "",
        p: "",
      },
      schema
    );
  }

  /**
   *   reactListKey?: string;
   *   href?: string;
   *   children: string;
   */
  return (
    <>
      <details className="govuk-details">
        <summary className="govuk-details__summary">
          <span className="govuk-details__summary-text">
            Developer settings
          </span>
        </summary>
        <p>{errors?.toString()}</p>
        <ErrorSummary
          titleChildren="There is a problem"
          errorList={errorList}
        />

        <form action="" onSubmit={submit}>
          <Input
            id="test-pay-api-key"
            name="test-pay-api-key"
            label={{
              className: "govuk-label--s",
              children: ["Test Pay API Key"],
            }}
            defaultValue={testApiKey.value}
            onChange={testApiKey.onChange}
          />

          <Input
            id="prod-pay-api-key"
            name="prod-pay-api-key"
            label={{
              className: "govuk-label--s",
              children: ["Production Pay API Key"],
            }}
            defaultValue={prodApiKey.value}
            onChange={prodApiKey.onChange}
          />

          <Input
            id="pay-reference-format"
            name="pay-reference-format"
            label={{
              className: "govuk-label--s",
              children: ["Pay reference format"],
            }}
            defaultValue={paymentReferenceFormat.value}
            onChange={paymentReferenceFormat.onChange}
          />

          <Input
            id="pay-return-url"
            name="pay-return-url"
            label={{
              className: "govuk-label--s",
              children: ["Pay return URL"],
            }}
            defaultValue={payReturnUrl.value}
            onChange={payReturnUrl.onChange}
          />

          <button
            className="govuk-button govuk-button--secondary"
            type="submit"
          >
            Save Fee options
          </button>
        </form>
      </details>
    </>
  );
}
