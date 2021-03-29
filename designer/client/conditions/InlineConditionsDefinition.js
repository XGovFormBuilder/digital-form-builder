import React from "react";
import {
  Condition,
  ConditionField,
  ConditionRef,
  conditionValueFrom,
  getOperatorNames,
  clone,
} from "@xgovformbuilder/model";
import { i18n } from "../i18n";

import { InlineConditionsDefinitionValue } from "./InlineConditionsDefinitionValue";

function isCondition(fieldDef) {
  return fieldDef?.type === "Condition";
}

class InlineConditionsDefinition extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      condition: clone(props.condition) || {},
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.expectsCoordinator !== prevProps.expectsCoordinator ||
      this.props.fields !== prevProps.fields
    ) {
      const { condition } = this.state;
      const newCondition = this.props.fields[condition?.field?.name]
        ? this.state.condition
        : {};
      this.setState({
        condition: newCondition,
      });
    }
  }

  onChangeCoordinator = (e) => {
    const input = e.target;
    let newCondition = {};

    if (input.value && input.value.trim() !== "") {
      newCondition = clone(this.state.condition ?? {});
      newCondition.coordinator = input.value;
    }
    this.setState({
      condition: newCondition,
    });
  };

  onClickFinalise = () => {
    const { condition } = this.state;
    this.setState({
      condition: {},
    });

    const fieldDef = this.props.fields[condition.field.name];
    if (isCondition(fieldDef)) {
      this.props.saveCallback(
        new ConditionRef(fieldDef.name, fieldDef.label, condition.coordinator)
      );
    } else {
      this.props.saveCallback(
        new Condition(
          ConditionField.from(condition.field),
          condition.operator,
          conditionValueFrom(condition.value),
          condition.coordinator
        )
      );
    }
  };

  onChangeField = (e) => {
    const input = e.target;
    const fieldName = input.value;

    const { condition } = this.state;

    const currentField = condition.field?.name;
    const currentOperator = condition.operator;

    const fieldDef = this.props.fields[fieldName];

    this._updateCondition(condition, (c) => {
      if (fieldName) {
        if (isCondition(fieldDef)) {
          delete c.value;
          delete c.operator;
        } else {
          if (
            currentField &&
            this.props.fields[currentField].values !== fieldDef.values
          ) {
            delete c.value;
          }
          if (
            currentOperator &&
            !getOperatorNames(fieldName).includes(currentOperator)
          ) {
            delete c.operator;
          }
        }
        c.field = {
          name: fieldName,
          display: fieldDef.label,
          type: fieldDef.type,
        };
      } else {
        delete c.field;
        delete c.operator;
        delete c.value;
      }
    });
  };

  _updateCondition(condition, updates) {
    const copy = clone(condition);
    updates(copy);
    this.setState({
      condition: copy,
    });
  }

  onChangeOperator = (e) => {
    const input = e.target;
    const { condition } = this.state;

    this._updateCondition(condition, (c) => {
      c.operator = input.value;
    });
  };

  updateValue = (newValue) => {
    const { condition } = this.state;
    this._updateCondition(condition, (c) => {
      c.value = newValue;
    });
  };

  setState(state, callback) {
    if (state.conditions || state.selectedCondition !== undefined) {
      this.props.conditionsChange(state.conditions, state.selectedCondition);
    }
    super.setState(state, callback);
  }

  render() {
    const { expectsCoordinator, fields } = this.props;
    const { condition } = this.state;
    const fieldDef = fields[condition.field?.name];

    return (
      <div className="govuk-form-group" id="condition-definition-group">
        {expectsCoordinator && (
          <div className="govuk-form-group" id="cond-coordinator-group">
            <select
              className="govuk-select"
              id="cond-coordinator"
              name="cond-coordinator"
              value={condition?.coordinator ?? ""}
              onChange={this.onChangeCoordinator}
            >
              <option />
              <option key="and" value="and">
                And
              </option>
              <option key="or" value="or">
                Or
              </option>
            </select>
          </div>
        )}
        {(condition.coordinator || !expectsCoordinator) && (
          <div id="condition-definition-inputs">
            <select
              className="govuk-select"
              id="cond-field"
              name="cond-field"
              value={condition?.field?.name ?? ""}
              onChange={this.onChangeField}
            >
              <option />
              {Object.values(this.props.fields).map((field, index) => (
                <option key={`${field.name}-${index}`} value={field.name}>
                  {field.label}
                </option>
              ))}
            </select>

            {fieldDef && !isCondition(fieldDef) && (
              <select
                className="govuk-select"
                id="cond-operator"
                name="cond-operator"
                value={condition.operator ?? ""}
                onChange={this.onChangeOperator}
              >
                <option />
                {getOperatorNames(fieldDef.type).map((conditional) => {
                  return (
                    <option
                      key={`${condition.field}-${conditional}`}
                      value={conditional}
                    >
                      {conditional}
                    </option>
                  );
                })}
              </select>
            )}

            {condition.operator && (
              <InlineConditionsDefinitionValue
                fieldDef={fieldDef}
                value={condition.value}
                operator={condition.operator}
                updateValue={this.updateValue}
              />
            )}
            {(condition.value || isCondition(fieldDef)) && (
              <div className="govuk-form-group">
                <button
                  id="save-condition"
                  className="govuk-link"
                  onClick={this.onClickFinalise}
                >
                  {i18n("add")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default InlineConditionsDefinition;
