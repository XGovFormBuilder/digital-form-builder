import React, { useContext, useEffect, useState } from "react";
import Editor from "./editor";
import { clone, ConditionsWrapper } from "@xgovformbuilder/model";
import { DataContext } from "./context";
import { removeCondition, updateCondition } from "./data";
import logger from "../client/plugins/logger";
import { val } from "cheerio/lib/api/attributes";

const ConditionEdit = (props) => {
  const { data, save } = useContext(DataContext);
  const [displayName, setDisplayName] = useState(props.condition.displayName);
  const [value, setValue] = useState(props.condition.value);

  const { condition } = props;

  const wrappedCondition = new ConditionsWrapper(condition);

  const onSubmit = async (e) => {
    e.preventDefault();
    const newValue = value;

    const updated = updateCondition(data, condition.name, {
      displayName,
      value: newValue,
    });

    try {
      const saved = await save(updated);
      props.onEdit({ data: saved });
    } catch (err) {
      logger.error("ConditionEdit", err);
    }
  };

  const onClickDelete = async (e) => {
    e.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    // Remove the condition
    const updatedData = removeCondition(data, condition.name);
    try {
      await save(updatedData);
      props.onEdit({ data });
    } catch (e) {
      logger.error("ConditionEdit", e);
    }
  };

  const onBlurName = (e) => {
    const input = e.target;
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

    setDisplayName(newName);
  };

  const onValueChange = (value) => {
    setValue(value);
  };

  return (
    <form onSubmit={(e) => onSubmit(e)} autoComplete="off">
      <a
        className="govuk-back-link"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          props.onCancel(e);
        }}
      >
        Back
      </a>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="condition-name">
          Display name
        </label>
        <input
          className="govuk-input"
          id="condition-name"
          name="displayName"
          type="text"
          defaultValue={condition.displayName}
          required
          onBlur={onBlurName}
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="condition-value">
          Value
        </label>
        <Editor
          name="value"
          required
          value={wrappedCondition.expression}
          valueCallback={onValueChange}
        />
      </div>
      <button className="govuk-button" type="submit">
        Save
      </button>{" "}
      <button className="govuk-button" type="button" onClick={onClickDelete}>
        Delete
      </button>
    </form>
  );
};

export default ConditionEdit;
