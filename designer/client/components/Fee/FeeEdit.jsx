import { FeeItems } from "./FeeItems";
import React from "react";
import { clone } from "@xgovformbuilder/model";
import { Input } from "@govuk-jsx/input";

import ErrorSummary from "./../../error-summary";
import { DataContext } from "../../context";
import logger from "../../plugins/logger";
export class FeeEdit extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    this.feeItemsRef = React.createRef();
    this.state = {
      errors: {},
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new window.FormData(form);
    const { data, save } = this.context;

    // Items
    const testPayApiKey = formData.get("test-pay-api-key").trim();
    const prodPayApiKey = formData.get("prod-pay-api-key").trim();
    const descriptions = formData.getAll("description").map((t) => t.trim());
    const amount = formData.getAll("amount").map((t) => t.trim());
    const conditions = formData.getAll("condition").map((t) => t.trim());
    const multipliers = formData
      .getAll("multiplier")
      .map((t) => t.trim() ?? "0");

    let hasValidationErrors = this.validate(testPayApiKey, form);
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
      multiplier: multipliers[i],
    }));

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("FeeEdit", err);
      });
  };

  validate = (payApiKey, form) => {
    let apiKeyHasErrors = !payApiKey || payApiKey.length < 1;
    let itemValidationErrors = this.feeItemsRef.current.validate(form);
    let hasValidationErrors =
      apiKeyHasErrors || Object.keys(itemValidationErrors).length > 0;
    let errors = {};
    if (apiKeyHasErrors) {
      errors.payapi = {
        href: "#test-pay-api-key",
        children: "Enter Pay API key",
      };
    }
    this.setState({
      errors: {
        ...itemValidationErrors,
        ...errors,
      },
      hasValidationErrors,
    });

    return hasValidationErrors;
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { save } = this.context;
    const { data, fee } = this.props;
    const copy = clone(data);

    copy.fees.splice(data.fees.indexOf(fee), 1);

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("FeeEdit", err);
      });
  };

  render() {
    const { data } = this.context;
    const { fees, conditions, payApiKey } = data;
    const { errors, hasValidationErrors } = this.state;
    return (
      <div className="govuk-body">
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
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
            ref={this.feeItemsRef}
          />

          <button className="govuk-button" type="submit">
            Save
          </button>
        </form>
      </div>
    );
  }
}
