import React, { ChangeEvent } from "react";
import InlineConditions from "./InlineConditions";
import {
  Condition,
  ConditionRef,
  ConditionsModel,
} from "@xgovformbuilder/model";
import { Flyout } from "../components/Flyout";
import { Select } from "@govuk-jsx/select";
import { Hint } from "@govuk-jsx/hint";
import { i18n } from "../i18n";
import { DataContext } from "../context";
import { RenderInPortal } from "../components/RenderInPortal";
import {
  allInputs,
  inputsAccessibleAt,
  hasConditions as dataHasConditions,
} from "../data";
import { getConditionType, isConditionRef } from "./select-condition-helpers";
interface Props {
  path: string;
  conditionsChange: (selectedCondition: string) => void;
  hints: any[];
  noFieldsHintText?: string;
}

interface State {
  inline: boolean;
  selectedCondition: string;
  fields: any;
}

type ConditionObject = {
  name: string;
  conditions: Condition[];
};

export type ConditionData = {
  name: string;
  displayName: string;
  value: string | ConditionObject;
};

class SelectConditions extends React.Component<Props, State> {
  static contextType = DataContext;

  constructor(props, context) {
    super(props, context);

    this.state = {
      fields: this.fieldsForPath(props.path),
      inline: false,
      selectedCondition: props.selectedCondition,
    };
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.path !== prevProps.path) {
      const fields = this.fieldsForPath(this.props.path);

      this.setState({
        conditions: new ConditionsModel(),
        fields: fields,
        editView: false,
      });
    }
  };

  fieldsForPath(path: string) {
    const { data } = this.context;
    const inputs = path
      ? inputsAccessibleAt(data, path)
      : allInputs(data) ?? [];
    return inputs.map((input) => input.propertyPath);
  }

  conditionsForPath(path: string) {
    const { data } = this.context;
    const fields: any = Object.values(this.fieldsForPath(path));
    const { conditions = [] } = data;
    let sortedConditions = this.sortConditions(conditions);
    let validConditionNames = [];
    return sortedConditions.filter((condition) => {
      if (getConditionType(condition) === "string") {
        return this.handleStringCondition(
          condition,
          fields,
          validConditionNames
        );
      }
      if (getConditionType(condition) === "nested") {
        return this.handleNestedCondition(
          condition,
          fields,
          validConditionNames
        );
      }
      if (getConditionType(condition) === "object") {
        return this.handleCondition(condition, fields, validConditionNames);
      }
      return false;
    });
  }

  sortConditions(conditions: ConditionData[]) {
    return conditions
      .reduce<ConditionData[][]>(
        (acc, curr) => {
          acc[getConditionType(curr) === "nested" ? 1 : 0].push(curr);
          return acc;
        },
        [[], []]
      )
      .flat();
  }

  handleCondition(
    condition: ConditionData,
    fields: string[],
    validConditions: string[]
  ) {
    let conditionValue = condition.value as ConditionObject;
    for (let i = 0; i < conditionValue.conditions.length; i++) {
      if (!fields.includes(conditionValue.conditions[i].field.name)) {
        return false;
      }
    }
    validConditions.push(condition.name);
    return true;
  }

  handleStringCondition(
    condition: ConditionData,
    fields: string[],
    validConditions: string[]
  ) {
    const conditionValue: string = condition.value as string;
    const operators = ["==", "!=", ">", "<"];
    if (!operators.some((operator) => conditionValue.includes(operator))) {
      return false;
    }
    let conditionFieldName = conditionValue.substring(
      0,
      conditionValue.lastIndexOf(
        operators.find((operator) =>
          conditionValue.includes(operator)
        ) as string
      )
    );
    if (fields.includes(conditionFieldName)) {
      validConditions.push(condition.name);
      return true;
    }
    return false;
  }
  // loops through nested conditions, checking the referenced condition against the current field
  handleNestedCondition(
    condition: ConditionData,
    fields: string[],
    validConditions: string[]
  ) {
    let conditionValue = condition.value as ConditionObject;
    for (let i = 0; i < conditionValue.conditions.length; i++) {
      let innerCondition: Condition | ConditionRef =
        conditionValue.conditions[i];
      if (
        !isConditionRef(innerCondition) &&
        !fields.includes(innerCondition.field.name)
      ) {
        return false;
      }
      if (
        isConditionRef(innerCondition) &&
        !validConditions.includes(innerCondition.conditionName)
      ) {
        return false;
      }
    }
    validConditions.push(condition.name);
    return true;
  }

  onClickDefineCondition = (e) => {
    e.preventDefault();
    this.setState({
      inline: true,
    });
  };

  setState(state, callback?: () => void) {
    if (state.selectedCondition !== undefined) {
      this.props.conditionsChange(state.selectedCondition);
    }
    super.setState(state, callback);
  }

  onChangeConditionSelection = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    this.setState({
      selectedCondition: input.value,
    });
  };

  onCancelInlineCondition = () => {
    this.setState({
      inline: false,
    });
  };

  onSaveInlineCondition = (createdCondition) => {
    this.setState({
      inline: false,
      selectedCondition: createdCondition,
    });
  };

  render() {
    const { selectedCondition, inline } = this.state;
    const { hints = [], noFieldsHintText } = this.props;
    const conditions = this.conditionsForPath(this.props.path);
    const hasConditions = dataHasConditions(conditions) || selectedCondition;
    const hasFields = Object.keys(this.state.fields ?? {}).length > 0;

    return (
      <div className="conditions" data-testid="select-conditions">
        <div className="govuk-form-group" id="conditions-header-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="page-conditions"
          >
            {i18n("conditions.optional")}
          </label>
          {hints.map((hint, index) => (
            <Hint key={`conditions-header-group-hint-${index}`}>{hint}</Hint>
          ))}
        </div>
        {hasFields || hasConditions ? (
          <div>
            {hasConditions && (
              <Select
                id="select-condition"
                name="cond-select"
                data-testid="select-condition"
                value={selectedCondition ?? ""}
                items={[
                  {
                    children: [""],
                    value: "",
                  },
                  ...conditions.map((it) => ({
                    children: [it.displayName],
                    value: it.name,
                  })),
                ]}
                label={{
                  className: "govuk-label--s",
                  children: ["Select a condition"],
                }}
                onChange={this.onChangeConditionSelection}
                required={false}
              />
            )}
            {!inline && (
              <div className="govuk-form-group">
                <a
                  href="#"
                  id="inline-conditions-link"
                  className="govuk-link"
                  onClick={this.onClickDefineCondition}
                >
                  Define a new condition
                </a>
              </div>
            )}
            {inline && (
              <RenderInPortal>
                <Flyout
                  title="Define condition"
                  onHide={this.onCancelInlineCondition}
                >
                  <InlineConditions
                    path={this.props.path}
                    conditionsChange={this.onSaveInlineCondition}
                    cancelCallback={this.onCancelInlineCondition}
                  />
                </Flyout>
              </RenderInPortal>
            )}
          </div>
        ) : (
          <div className="govuk-body">
            <div className="govuk-hint">{noFieldsHintText}</div>
          </div>
        )}
      </div>
    );
  }
}

export default SelectConditions;
