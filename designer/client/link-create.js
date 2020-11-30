import React from "react";
import SelectConditions from "./conditions/select-conditions";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";
import { ErrorSummary } from "./error-summary";

class LinkCreate extends React.Component {
  state = { errors: {} };

  onSubmit = async (e) => {
    e.preventDefault();
    const { from, to, selectedCondition } = this.state;
    const hasValidationErrors = this.validate();
    if (hasValidationErrors) return;
    // Apply
    const { data } = this.props;
    const copy = data.clone();
    const updatedData = copy.addLink(from, to, selectedCondition);
    const savedData = await data.save(updatedData);
    this.props.onCreate({ data: savedData });
  };

  conditionSelected = (selectedCondition) => {
    this.setState({
      selectedCondition: selectedCondition,
    });
  };

  storeValue = (e, key) => {
    const input = e.target;
    const stateUpdate = {};
    stateUpdate[key] = input.value;
    this.setState(stateUpdate);
  };

  validate = () => {
    const { from, to, selectedCondition } = this.state;
    let errors = {};
    if (!from) {
      errors.from = { href: "#link-source", children: "Enter from" };
    }
    if (!to) {
      errors.to = { href: "#link-source", children: "Enter to" };
    }
    this.setState({
      errors,
    });
    return !from || !to;
  };

  render() {
    const { data } = this.props;
    const { pages } = data;
    const { from, errors } = this.state;
    let hasValidationErrors = Object.keys(errors).length > 0;

    return (
      <>
        {hasValidationErrors && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
          <div
            className={classNames({
              "govuk-form-group": true,
              "govuk-form-group--error": errors?.from,
            })}
          >
            <label className="govuk-label govuk-label--s" htmlFor="link-source">
              From
            </label>
            {errors?.from && (
              <ErrorMessage>{errors?.from.children}</ErrorMessage>
            )}
            <select
              className={classNames({
                "govuk-select": true,
                "govuk-input--error": errors?.from,
              })}
              id="link-source"
              name="path"
              onChange={(e) => this.storeValue(e, "from")}
            >
              <option />
              {pages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.title}
                </option>
              ))}
            </select>
          </div>

          <div
            className={classNames({
              "govuk-form-group": true,
              "govuk-form-group--error": errors?.to,
            })}
          >
            <label className="govuk-label govuk-label--s" htmlFor="link-target">
              To
            </label>
            {errors?.to && <ErrorMessage>{errors?.to.children}</ErrorMessage>}
            <select
              className={classNames({
                "govuk-select": true,
                "govuk-input--error": errors?.to,
              })}
              id="link-target"
              name="page"
              onChange={(e) => this.storeValue(e, "to")}
            >
              <option />
              {pages.map((page) => (
                <option key={page.path} value={page.path}>
                  {page.title}
                </option>
              ))}
            </select>
          </div>

          {from && from.trim() !== "" && (
            <SelectConditions
              data={data}
              path={from}
              conditionsChange={this.conditionSelected}
            />
          )}

          <button className="govuk-button" type="submit">
            Save
          </button>
        </form>
      </>
    );
  }
}

export default LinkCreate;
