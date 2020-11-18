import FeeItems from "./fee-items";
import React from "react";
import { clone } from "@xgovformbuilder/model";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";

class FeeEdit extends React.Component {
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

    data
      .save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  validate = (payApiKey, form) => {
    let validationErrors = false;
    let apiKeyHasErrors = !payApiKey || payApiKey.length < 1;
    this.setState((prevState, props) => ({
      errors: {
        ...prevState.errors,
        payapi: apiKeyHasErrors,
      },
    }));
    let itemValidationErrors = this.feeItemsRef.current.validate(form);
    validationErrors = apiKeyHasErrors || itemValidationErrors;
    return validationErrors;
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, fee } = this.props;
    const copy = clone(data);

    copy.fees.splice(data.fees.indexOf(fee), 1);

    data
      .save(copy)
      .then((data) => {
        console.log(data);
        this.props.onEdit({ data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  render() {
    const { data } = this.props;
    const { fees, conditions, payApiKey } = data;
    const { errors } = this.state;
    return (
      <div className="govuk-body">
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
          <div
            className={classNames({
              "govuk-form-group": true,
              "govuk-form-group--error": errors.payapi,
            })}
          >
            <label htmlFor="pay-api-key">Pay API Key</label>
            {errors.payapi && (
              <ErrorMessage>This field is required</ErrorMessage>
            )}

            <input
              className={classNames({
                "govuk-input": true,
                "govuk-input--error": errors.payapi,
              })}
              id="pay-api-key"
              name="pay-api-key"
              type="text"
              defaultValue={payApiKey}
            />
          </div>

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
