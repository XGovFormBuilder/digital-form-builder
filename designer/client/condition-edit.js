import React from "react";
import Editor from "./editor";
import { clone } from "@xgovformbuilder/model";
import { DataContext } from "./context";

class ConditionEdit extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    this.state = {
      displayName: props.condition.displayName,
      value: props.condition.expression,
    };
  }

  onSubmit = async (e) => {
    e.preventDefault();
    const { save } = this.context;
    const displayName = this.state.displayName;
    const newValue = this.state.value;
    const { data, condition } = this.props;

    const copy = clone(data);
    const updated = copy.updateCondition(condition.name, displayName, newValue);

    try {
      const saved = await save(updated);
      this.props.onEdit({ data: saved });
    } catch (err) {
      console.error(err);
    }
  };

  onClickDelete = (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { save } = this.context;
    const { data, condition } = this.props;
    const copy = clone(data);

    // Remove the condition
    copy.removeCondition(condition.name);

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  onBlurName = (e) => {
    const input = e.target;
    const { data, condition } = this.props;
    const newName = input.value.trim();

    // Validate it is unique
    if (
      data.conditions.find(
        (s) => s.name !== condition.name && s.displayName === newName
      )
    ) {
      input.setCustomValidity(`Display name '${newName}' already exists`);
    } else {
      input.setCustomValidity("");
    }

    this.setState({
      displayName: newName,
    });
  };

  onValueChange = (value) => {
    this.setState({
      value: value,
    });
  };

  render() {
    const { condition } = this.props;

    return (
      <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
        <a
          className="govuk-back-link"
          href="#"
          onClick={(e) => this.props.onCancel(e)}
        >
          Back
        </a>
        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="condition-name"
          >
            Display name
          </label>
          <input
            className="govuk-input"
            id="condition-name"
            name="displayName"
            type="text"
            defaultValue={condition.displayName}
            required
            onBlur={this.onBlurName}
          />
        </div>
        <div className="govuk-form-group">
          <label
            className="govuk-label govuk-label--s"
            htmlFor="condition-value"
          >
            Value
          </label>
          <Editor
            name="value"
            required
            value={condition.expression}
            valueCallback={this.onValueChange}
          />
        </div>
        <button className="govuk-button" type="submit">
          Save
        </button>{" "}
        <button
          className="govuk-button"
          type="button"
          onClick={this.onClickDelete}
        >
          Delete
        </button>
      </form>
    );
  }
}

export default ConditionEdit;
