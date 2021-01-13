import FeeItems from "./fee-items";
import React from "react";
import { clone } from "@xgovformbuilder/model";
import { Input } from "@govuk-jsx/input";

import ErrorSummary from "./error-summary";
import { DataContext } from "./context";

class FeeEdit extends React.Component {
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
    const { data } = this.props;
    const { save } = this.context;

    // Items
    const payApiKey = formData.get("pay-api-key").trim();
    const descriptions = formData.getAll("description").map((t) => t.trim());
    const amount = formData.getAll("amount").map((t) => t.trim());
    const conditions = formData.getAll("condition").map((t) => t.trim());

    let hasValidationErrors = this.validate(payApiKey, form);
    if (hasValidationErrors) return;

    const copy = clone(data);
    copy.payApiKey = payApiKey;
    copy.fees = descriptions.map((description, i) => ({
      description,
      amount: amount[i],
      condition: conditions[i],
    }));

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  validate = (payApiKey, form) => {
    let apiKeyHasErrors = !payApiKey || payApiKey.length < 1;
    let itemValidationErrors = this.feeItemsRef.current.validate(form);
    let hasValidationErrors =
      apiKeyHasErrors || Object.keys(itemValidationErrors).length > 0;
    let errors = {};
    if (apiKeyHasErrors) {
      errors.payapi = { href: "#pay-api-key", children: "Enter Pay API key" };
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
        console.error(err);
      });
  };

  render() {
    const { data } = this.props;
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
            id="pay-api-key"
            name="pay-api-key"
            label={{
              className: "govuk-label--s",
              children: ["Pay API Key"],
            }}
            defaultValue={payApiKey}
            errorMessage={
              errors?.payapi
                ? { children: errors?.payapi?.children }
                : undefined
            }
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

export default FeeEdit;
