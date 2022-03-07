import { FeeItems } from "./FeeItems";
import React, { useContext, useEffect, useRef, useState } from "react";
import { clone } from "@xgovformbuilder/model";
import { Input } from "@govuk-jsx/input";

import ErrorSummary from "../../error-summary";
import { DataContext } from "../../context";
import logger from "../../plugins/logger";
import { AnyLengthString } from "aws-sdk/clients/comprehendmedical";

export function FeeEdit(props = {}) {
  const { data, save } = useContext(DataContext);
  const feeItemsRef = useRef(FeeItems);
  const { fees, conditions, payApiKey } = data;
  const [errors, setErrors] = useState({});
  const [hasValidationErrors, setHasValidationErrors] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    // Items
    const testPayApiKey = formData.get("test-pay-api-key")?.toString().trim();
    const prodPayApiKey = formData.get("prod-pay-api-key")?.toString().trim();
    const descriptions = formData.getAll("description").map((t) => t.toString().trim());
    const amount = formData.getAll("amount").map((t) => Number(t.toString().trim()));
    const conditions = formData.getAll("condition").map((t) => t.toString().trim());

    let hasValidationErrors = validate(testPayApiKey, form);
    if (hasValidationErrors) return;

    const copy = clone(data);
    copy.payApiKey = {
      test: testPayApiKey,
      production: prodPayApiKey,
    };
    copy.fees = descriptions.map((description, i) => ({
      description,
      amount: amount[i],
      condition: conditions[i],
    }));

    save(copy)
      .then((data) => {
        props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("FeeEdit", err);
      });
  };

  const validate = (payApiKey, form) => {
    let apiKeyHasErrors = !payApiKey || payApiKey.length < 1;
    let itemValidationErrors = feeItemsRef.current.value.validate(form);
    let hasValidationErrors =
      apiKeyHasErrors || Object.keys(itemValidationErrors).length > 0;
    let errors = {};
    if (apiKeyHasErrors) {
      errors.payapi = {
        href: "#test-pay-api-key",
        children: "Enter Pay API key",
      };
    }
    setErrors({
      errors: {
        ...itemValidationErrors,
        ...errors,
      },
      hasValidationErrors,
    });

    setHasValidationErrors(
      hasValidationErrors
    );

    return hasValidationErrors;
  };

  const onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { fee } = props;
    const copy = clone(data);

    copy.fees.splice(data.fees.indexOf(fee), 1);

    save(copy)
      .then((data) => {
        props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("FeeEdit", err);
      });
  };

  return (
    <div className="govuk-body">
      <form onSubmit={onSubmit} autoComplete="off">
        {hasValidationErrors && (
          <ErrorSummary
            titleChildren="There is a problem"
            errorList={Object.values(errors)}
          />
        )}
        <Input
          id="test-pay-api-key"
          name="test-pay-api-key"
          label={{
            className: "govuk-label--s",
            children: ["Test Pay API Key"],
          }}
          defaultValue={payApiKey?.test ?? payApiKey?.production ?? payApiKey}
          errorMessage={
            errors?.payapi
              ? { children: errors?.payapi?.children }
              : undefined
          }
        />

        <Input
          id="prod-pay-api-key"
          name="prod-pay-api-key"
          label={{
            className: "govuk-label--s",
            children: ["Production Pay API Key"],
          }}
          defaultValue={payApiKey?.production ?? payApiKey?.test ?? payApiKey}
        />
        <FeeItems
          items={fees}
          conditions={conditions}
          ref={feeItemsRef}
        />

        <button className="govuk-button" type="submit">
          Save
        </button>
      </form>
    </div>
  );
}
