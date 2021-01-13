import React, { MouseEvent, ChangeEvent } from "react";
import { ConditionsModel, clone } from "@xgovformbuilder/model";
import InlineConditionsDefinition from "./InlineConditionsDefinition";
import InlineConditionsEdit from "./inline-conditions-edit";

import helpers from "./inline-condition-helpers";
import { DataContext } from "../context";

interface Props {
  path: string;
  condition?: any;
  data: any;
  cancelCallback?: (event: MouseEvent) => void;
  conditionsChange?: (name: string) => void;
}

interface State {
  editView?: boolean;
  conditions: ConditionsModel;
  fields: any;
  conditionString: any;
}

class InlineConditions extends React.Component<Props, State> {
  static contextType = DataContext;

  constructor(props) {
    super(props);

    const { path, condition } = this.props;

    const conditions =
      condition && typeof condition.value === "object"
        ? ConditionsModel.from(condition.value)
        : new ConditionsModel();

    if (condition) {
      conditions.name = condition.displayName;
    }

    this.state = {
      conditions: conditions,
      fields: this.fieldsForPath(path),
      conditionString:
        condition && typeof condition.value === "string"
          ? condition.value
          : undefined,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.path !== prevProps.path) {
      const fields = this.fieldsForPath(this.props.path);

      this.setState({
        conditions: new ConditionsModel(),
        fields: fields,
        editView: false,
      });
    }
  }

  fieldsForPath(path) {
    const { data } = this.props;
    const inputs = path ? data.inputsAccessibleAt(path) : data.allInputs();
    const fieldInputs = inputs.map((input) => ({
      label: input.displayName,
      name: input.propertyPath,
      type: input.type,
      values: data.valuesFor(input)?.toStaticValues()?.items,
    }));
    const conditionsInputs = data.conditions.map((condition) => ({
      label: condition.displayName,
      name: condition.name,
      type: "Condition",
    }));

    return fieldInputs.concat(conditionsInputs).reduce((obj, item) => {
      obj[item.name] = item;
      return obj;
    }, {});
  }

  toggleEdit = () => {
    this.setState({
      editView: !this.state.editView,
    });
  };

  onClickCancel = (e: MouseEvent<HTMLAnchorElement>) => {
    const { cancelCallback } = this.props;
    this.setState({
      conditions: this.state.conditions.clear(),
      editView: false,
    });
    if (cancelCallback) {
      cancelCallback(e);
    }
  };

  onClickSave = async () => {
    const { data, conditionsChange, condition } = this.props;
    const { save } = this.context;
    const { conditions } = this.state;
    const copy = clone(data);

    if (condition) {
      const updatedData = data.updateCondition(
        condition.name,
        conditions.name,
        conditions
      );
      await save(updatedData);
      if (conditionsChange) {
        conditionsChange(condition.name);
      }
    } else {
      const conditionResult = await helpers.storeConditionIfNecessary(
        copy,
        conditions
      );
      await save(conditionResult.data);
      if (conditionsChange) {
        conditionsChange(conditionResult.condition);
      }
    }
  };

  saveCondition = (condition) => {
    this.setState({
      conditions: this.state.conditions.add(condition),
    });
  };

  editCallback = (conditions) => {
    this.setState({
      conditions: conditions,
    });
  };

  onChangeDisplayName = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const copy = clone(this.state.conditions);
    copy.name = input.value;
    this.setState({
      conditions: copy,
    });
  };

  render() {
    const { conditions, editView, conditionString } = this.state;
    const hasConditions = conditions.hasConditions;

    return (
      this.state.fields &&
      Object.keys(this.state.fields).length > 0 && (
        <div id="inline-conditions">
          <div id="inline-condition-header">
            {conditionString && (
              <div
                id="condition-string-edit-warning"
                className="govuk-warning-text"
              >
                <span className="govuk-warning-text__icon" aria-hidden="true">
                  !
                </span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">Warning</span>
                  You cannot edit this condition &apos;{conditionString}&apos;.
                  Please recreate it in the editor below to continue
                </strong>
              </div>
            )}
            <div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="cond-name">
                  Display name
                </label>
                <input
                  className="govuk-input govuk-input--width-20"
                  id="cond-name"
                  name="cond-name"
                  type="text"
                  value={conditions.name}
                  required
                  onChange={this.onChangeDisplayName}
                />
              </div>
              <div className="govuk-form-group">
                <label
                  className="govuk-label"
                  id="condition-string-label"
                  htmlFor="condition-string"
                >
                  When
                </label>
              </div>
            </div>
            {hasConditions && (
              <div id="conditions-display" className="govuk-body">
                <div key="condition-string" id="condition-string">
                  {conditions.toPresentationString()}
                </div>
                {!editView && (
                  <div>
                    <a
                      href="#"
                      id="edit-conditions-link"
                      className="govuk-link"
                      onClick={this.toggleEdit}
                    >
                      Not what you meant?
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          {!editView && (
            <div>
              <InlineConditionsDefinition
                expectsCoordinator={hasConditions}
                fields={this.state.fields}
                saveCallback={this.saveCondition}
              />
              <div className="govuk-form-group">
                {hasConditions && (
                  <a
                    href="#"
                    id="save-inline-conditions"
                    className="govuk-button"
                    onClick={this.onClickSave}
                  >
                    Save
                  </a>
                )}
                <a
                  href="#"
                  id="cancel-inline-conditions-link"
                  className="govuk-link"
                  onClick={this.onClickCancel}
                >
                  Cancel
                </a>
              </div>
            </div>
          )}
          {editView && (
            <InlineConditionsEdit
              conditions={conditions}
              fields={this.state.fields}
              saveCallback={this.editCallback}
              exitCallback={this.toggleEdit}
            />
          )}
        </div>
      )
    );
  }
}

export default InlineConditions;
