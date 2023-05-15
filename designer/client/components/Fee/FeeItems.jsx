import React from "react";
import { clone } from "@xgovformbuilder/model";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";

import { isEmpty } from "../../helpers";
import { DataContext } from "../../context";
import logger from "../../plugins/logger";

function isDuplicated(arr) {
  return [...new Set(arr)].length !== arr.length;
}

const MISSING_DESC = "missingDescription";
const INVALID_AMOUNT = "invalidAmount";
const INVALID_MULTIPLIER = "invalidMultiplier";
const MISSING_COND = "missingCondition";
const DUP_CONDITIONS = "dupConditions";

export class FeeItems extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    this.state = {
      items: props.items ? clone(props.items) : [],
      errors: {},
    };
  }

  validate = (form) => {
    let errors = {};
    const formData = new window.FormData(form);
    let missingDescription = false;
    let missingDescriptions = {};
    let amountInvalid = false;
    let amountsInvalid = {};
    let multiplierInvalid = false;
    let multipliersInvalid = {};
    let missingCondition = false;
    let missingConditions = {};
    formData.getAll("description").forEach((d, i) => {
      if (isEmpty(d)) {
        missingDescriptions[i] = true;
        missingDescription = true;
      }
    });
    if (missingDescription) {
      missingDescriptions.href = "#items-table";
      missingDescriptions.children = "Enter description";
      errors[MISSING_DESC] = missingDescriptions;
    }

    formData.getAll("condition").forEach((d, i) => {
      if (isEmpty(d)) {
        missingDescriptions[i] = true;
        missingCondition = true;
      }
    });
    if (missingCondition) {
      missingConditions.href = "#items-table";
      missingConditions.children = "Select a condition";
      errors[MISSING_COND] = missingConditions;
    }

    formData.getAll("amount").forEach((d, i) => {
      if (d < 0) {
        amountsInvalid[i] = true;
        amountInvalid = true;
      }
    });
    if (amountInvalid) {
      amountsInvalid.href = "#items-table";
      amountsInvalid.children = "Enter a valid amount";
      errors[INVALID_AMOUNT] = amountsInvalid;
    }

    formData.getAll("multiplier").forEach((d, i) => {
      if (d < 0) {
        multipliersInvalid[i] = true;
        multiplierInvalid = true;
        errors[INVALID_MULTIPLIER] = multipliersInvalid;
      }
    });
    if (multiplierInvalid) {
      multipliersInvalid.href = "#items-table";
      multipliersInvalid.children = "Enter a valid quantity";
    }

    const descriptions = formData.getAll("description").map((t) => t.trim());
    const conditions = formData.getAll("condition").map((t) => t.trim());

    // Only validate dupes if there is more than one item
    if (descriptions.length >= 2 && isDuplicated(conditions)) {
      errors[DUP_CONDITIONS] = {
        href: "#items-table",
        children: "Duplicate conditions found in the list items",
      };
    }

    this.setState({
      errors,
    });

    return errors;
  };

  onClickAddItem = (e) => {
    e.preventDefault();
    this.setState({
      items: this.state.items.concat({
        description: "",
        amount: 0,
        condition: "",
        multiplier: "1",
      }),
    });
  };

  removeItem = (idx) => {
    this.setState((prevState, props) => ({
      items: this.state.items.filter((s, i) => i !== idx),
      errors: {},
    }));
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, fee } = this.props;
    const { save } = this.context;
    const copy = clone(data);

    // Remove the list
    copy.fees.splice(data.fees.indexOf(fee), 1);

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        logger.error("FeeItems", err);
      });
  };

  itemHasStaticQuantity = (item) => {
    console.log("item multiplier: ", item.multiplier);
    return !!parseInt(item.multiplier);
  };

  changeQuantityType = (event, item, index) => {
    event.preventDefault();
    const { fields } = this.props;
    let itemsCopy = [...this.state.items];
    let itemCopy = { ...item };
    if (this.itemHasStaticQuantity(item)) {
      itemCopy.multiplier = Object.keys(fields)[0] ?? "1";
    } else {
      itemCopy.multiplier = "1";
    }
    itemsCopy[index] = itemCopy;
    this.setState({
      items: itemsCopy,
    });
  };

  render() {
    const { items, errors } = this.state;
    const { conditions, fields } = this.props;

    console.log("fields: ", fields);

    let hasValidationErrors = Object.keys(errors).length > 0;

    const errorMessages = Object.entries(errors).map(([key, value]) => {
      return <ErrorMessage key={key}>{value?.children}</ErrorMessage>;
    });

    return (
      <div
        className={classNames({
          "govuk-form-group": true,
          "govuk-form-group--error": hasValidationErrors,
        })}
      >
        {errorMessages}

        <table className="govuk-table" id="items-table">
          <caption className="govuk-table__caption">Items</caption>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header" scope="col">
                Description
              </th>
              <th className="govuk-table__header" scope="col">
                Cost
              </th>
              <th className="govuk-table__header" scope="col">
                Condition
              </th>
              <th className="govuk-table__header" scope="col">
                Quantity
              </th>
              <th className="govuk-table__header" scope="col">
                <a
                  className="pull-right"
                  href="#"
                  role="button"
                  onClick={this.onClickAddItem}
                >
                  Add
                </a>
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {items.map((item, index) => (
              <tr
                key={item.description + index}
                className="govuk-table__row"
                scope="row"
              >
                <td className="govuk-table__cell">
                  <input
                    className={classNames({
                      "govuk-input": true,
                      "govuk-input--error": errors?.[MISSING_DESC]?.[index],
                    })}
                    name="description"
                    type="text"
                    defaultValue={item.description}
                  />
                </td>
                <td className="govuk-table__cell">
                  <input
                    className={classNames({
                      "govuk-input": true,
                      "govuk-input--error": errors?.[INVALID_AMOUNT]?.[index],
                    })}
                    name="amount"
                    type="number"
                    defaultValue={item.amount}
                    step="any"
                  />
                </td>
                <td className="govuk-table__cell">
                  <select
                    className={classNames({
                      "govuk-select": true,
                      "govuk-input--error": errors?.[MISSING_COND]?.[index],
                    })}
                    id="link-source"
                    name="condition"
                    defaultValue={item.condition}
                  >
                    {conditions.map((condition, i) => (
                      <option key={condition.name + i} value={condition.name}>
                        {condition.displayName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={"govuk-table__cell"}>
                  {this.itemHasStaticQuantity(item) ? (
                    <>
                      <input
                        className={classNames({
                          "govuk-input": true,
                          "govuk-input--error":
                            errors?.[INVALID_MULTIPLIER]?.[index],
                        })}
                        name="multiplier"
                        id="multiplier"
                        type="number"
                        defaultValue={item.multiplier ?? 0}
                        step="any"
                      />
                      {fields.length > 0 && (
                        <p className={"govuk-body govuk-!-margin-top-1"}>
                          <a
                            href={"#"}
                            role="button"
                            onClick={(e) =>
                              this.changeQuantityType(e, item, index)
                            }
                          >
                            Or choose a field
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <select
                        className="govuk-select govuk-!-width-full"
                        id="multiplier"
                        name="multiplier"
                        defaultValue={item.multiplier}
                      >
                        {fields.map((field) => (
                          <option
                            key={`item-${index}-field-${field.name}`}
                            value={field.name}
                          >
                            {field.label}
                          </option>
                        ))}
                      </select>
                      <p className={"govuk-body govuk-!-margin-top-1"}>
                        <a
                          href={"#"}
                          role="button"
                          onClick={(e) =>
                            this.changeQuantityType(e, item, index)
                          }
                        >
                          Or choose a number
                        </a>
                      </p>
                    </>
                  )}
                </td>
                <td className="govuk-table__cell" width="20px">
                  <a
                    className="list-item-delete"
                    onClick={() => this.removeItem(index)}
                  >
                    &#128465;
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
