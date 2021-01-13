import React from "react";
import InlineConditions from "./conditions/inline-conditions";
import { Flyout } from "./components/Flyout";

class ConditionsEdit extends React.Component {
  state = {};

  onClickCondition = (e, condition) => {
    e.preventDefault();

    this.setState({
      editingCondition: condition,
    });
  };

  onClickAddCondition = (e) => {
    e.preventDefault();

    this.setState({
      showAddCondition: true,
    });
  };

  render() {
    const { data } = this.props;
    const { conditions } = data;
    const { editingCondition } = this.state;

    return (
      <div className="govuk-body">
        {!editingCondition && (
          <div>
            <Flyout
              title="Add Condition"
              show={!!this.state.showAddCondition}
              onHide={this.cancelInlineCondition}
            >
              <InlineConditions
                data={data}
                conditionsChange={this.cancelInlineCondition}
                cancelCallback={this.cancelInlineCondition}
              />
            </Flyout>
            <ul className="govuk-list">
              {conditions.map((condition) => (
                <li key={condition.name}>
                  <a
                    href="#"
                    onClick={(e) => this.onClickCondition(e, condition)}
                  >
                    {condition.displayName}
                  </a>{" "}
                  <small>{condition.name}</small>
                  {"   ("}
                  <small>{condition.expression}</small>
                  {")"}
                </li>
              ))}
              <li>
                <hr />
                {data.allInputs().length > 0 ? (
                  <a
                    href="#"
                    id="add-condition-link"
                    onClick={(e) => this.onClickAddCondition(e)}
                  >
                    Add condition
                  </a>
                ) : (
                  <div className="govuk-body">
                    You cannot add any conditions as there are no available
                    fields
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
        {editingCondition && (
          <div id="edit-conditions">
            <Flyout title="Edit Conditions" show onHide={this.editFinished}>
              <InlineConditions
                data={data}
                condition={editingCondition}
                conditionsChange={this.editFinished}
                cancelCallback={this.editFinished}
              />
            </Flyout>
          </div>
        )}
      </div>
    );
  }

  editFinished = () => this.setState({ editingCondition: null });

  cancelInlineCondition = () => this.setState({ showAddCondition: false });
}

export default ConditionsEdit;
