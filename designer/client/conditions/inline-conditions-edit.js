import React from "react";
import {
  ConditionGroupDef,
  toPresentationString,
  clone,
} from "@xgovformbuilder/model";
import InlineConditionsDefinition from "./InlineConditionsDefinition";
import { EditIcon, MoveDownIcon, MoveUpIcon } from "../components/Icons";

class InlineConditionsEdit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      conditions: props.conditions,
      selectedConditions: [],
    };
  }

  render() {
    const {
      conditions,
      condition,
      editingIndex,
      editingError,
      selectedConditions,
    } = this.state;

    return (
      <div id="edit-conditions">
        {!editingIndex && editingIndex !== 0 && (
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
              Amend conditions
            </legend>
            {editingError && (
              <span id="conditions-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">Error:</span>{" "}
                {editingError}
              </span>
            )}
            <div id="editing-checkboxes" className="govuk-checkboxes">
              {conditions.asPerUserGroupings.map((condition, index) => {
                return (
                  <div
                    key={`condition-checkbox-${index}`}
                    className="govuk-checkboxes__item"
                    style={{ display: "flex" }}
                  >
                    <input
                      type="checkbox"
                      className="govuk-checkboxes__input"
                      id={`condition-${index}`}
                      name={`condition-${index}`}
                      value={index}
                      onChange={this.onChangeCheckbox}
                      checked={selectedConditions?.includes(index) || ""}
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor={`condition-${index}`}
                    >
                      {toPresentationString(condition)}
                    </label>
                    <span
                      id={`condition-${index}-actions`}
                      style={{ display: "inline-flex", flexGrow: 1 }}
                    >
                      {condition.isGroup() && (
                        <span style={{ flexGrow: 1 }}>
                          <a
                            href="#"
                            id={`condition-${index}-split`}
                            className="govuk-link"
                            onClick={() => this.onClickSplit(index)}
                          >
                            Split
                          </a>
                        </span>
                      )}
                      {!condition.isGroup() && (
                        <span style={{ flexGrow: 1 }}>
                          <a
                            href="#"
                            id={`condition-${index}-edit`}
                            className="govuk-link"
                            onClick={() => this.onClickEdit(index)}
                          >
                            <EditIcon bottom={true} />
                          </a>
                        </span>
                      )}
                      {index > 0 && (
                        <span>
                          <a
                            href="#"
                            id={`condition-${index}-move-earlier`}
                            onClick={() =>
                              this.onClickMove(
                                index,
                                this.state.conditions.moveEarlier
                              )
                            }
                          >
                            <MoveUpIcon />
                          </a>
                        </span>
                      )}
                      {index < conditions.lastIndex && (
                        <span>
                          <a
                            href="#"
                            id={`condition-${index}-move-later`}
                            className="govuk-link"
                            onClick={() =>
                              this.onClickMove(
                                index,
                                this.state.conditions.moveLater
                              )
                            }
                          >
                            <MoveDownIcon />
                          </a>
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="govuk-form-group" id="group-and-remove">
              {selectedConditions?.length > 1 && (
                <span>
                  <a
                    href="#"
                    id="group-conditions"
                    className="govuk-link"
                    onClick={this.onClickGroup}
                  >
                    Group
                  </a>{" "}
                  /
                </span>
              )}
              {selectedConditions?.length > 0 && (
                <a
                  href="#"
                  id="remove-conditions"
                  className="govuk-link"
                  onClick={this.onClickRemove}
                >
                  Remove
                </a>
              )}
            </div>
          </fieldset>
        )}
        {editingIndex >= 0 && (
          <InlineConditionsDefinition
            expectsCoordinator={editingIndex > 0}
            fields={this.props.fields}
            condition={condition}
            saveCallback={this.saveCondition}
          />
        )}
        <div className="govuk-form-group">
          <a
            href="#"
            id="cancel-edit-inline-conditions-link"
            className="govuk-link"
            onClick={this.onClickCancelEditView}
          >
            Finished editing
          </a>
        </div>
      </div>
    );
  }

  onChangeCheckbox = (e) => {
    let copy = clone(this.state.selectedConditions ?? []);
    const index = Number(e.target.value);
    if (e.target.checked) {
      copy.push(index);
    } else {
      copy = copy.filter((it) => it !== index);
    }
    this.setState({
      selectedConditions: copy,
    });
  };

  onClickGroup = () => {
    if (this.state.selectedConditions?.length < 2) {
      this.setState({
        editingError: "Please select at least 2 items for grouping",
      });
    } else {
      const groups = this.groupWithConsecutiveConditions(
        this.state.selectedConditions
      );
      if (groups.find((group) => group.length === 1)) {
        this.setState({
          editingError: "Please select consecutive items to group",
        });
      } else {
        this.setState({
          editingError: undefined,
          selectedConditions: [],
          conditions: this.state.conditions.addGroups(
            groups
              .sort((a, b) => a - b)
              .reduce((groupDefs, group) => {
                groupDefs.push(
                  new ConditionGroupDef(group[0], group[group.length - 1])
                );
                return groupDefs;
              }, [])
          ),
        });
      }
    }
  };

  onClickRemove = () => {
    if (this.state.selectedConditions?.length < 1) {
      this.setState({
        editingError: "Please select at least 1 item to remove",
      });
    } else {
      this.setState({
        editingError: undefined,
        selectedConditions: [],
        conditions: this.state.conditions.remove(this.state.selectedConditions),
        condition: undefined,
      });
    }
    if (!this.state.conditions.hasConditions) {
      this.props.exitCallback();
    }
  };

  groupWithConsecutiveConditions(selectedConditions) {
    const result = [];
    selectedConditions.sort((a, b) => a - b);
    selectedConditions.forEach((condition) => {
      const groupForCondition = result.find(
        (group) =>
          group.includes(condition - 1) || group.includes(condition + 1)
      );
      if (groupForCondition) {
        groupForCondition.push(condition);
      } else {
        result.push([condition]);
      }
    });
    return result;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.conditions !== this.props.conditions) {
      this.setState({
        conditions: this.props.conditions,
        selectedConditions: [],
      });
    }
  }

  onClickCancelEditView = () => {
    this.setState({
      selectedConditions: [],
      editingIndex: undefined,
    });
    this.props.exitCallback();
  };

  onClickSplit(index) {
    this.setState({
      conditions: this.state.conditions.splitGroup(index),
    });
  }

  onClickEdit(index) {
    const conditions = this.state.conditions.asPerUserGroupings;
    if (conditions.length > index) {
      this.setState({
        editingIndex: index,
        condition: Object.assign({}, conditions[index]),
      });
    }
  }

  onClickMove(index, moveFunction) {
    this.setState({
      conditions: moveFunction(index),
      selectedConditions: [],
    });
  }

  setState(state, callback) {
    if (state.conditions) {
      this.props.saveCallback(state.conditions);
    }
    super.setState(state, callback);
  }

  saveCondition = (condition) => {
    this.setState({
      conditions: this.state.conditions.replace(
        this.state.editingIndex,
        condition
      ),
      condition: undefined,
      editingIndex: undefined,
    });
  };
}

export default InlineConditionsEdit;
