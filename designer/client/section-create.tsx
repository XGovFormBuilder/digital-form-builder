import React, { useState, useContext } from "react";
import { clone } from "@xgovformbuilder/model";
import { camelCase } from "./helpers";
import { DataContext } from "./context";
import { addSection } from "./data/section/addSection";
import logger from "./plugins/logger";
import { string } from "joi";

const SectionCreate = (props) => {
  const { data, save } = useContext(DataContext);
  //{ title; name; generatedName }
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [generatedName, setGeneratedName] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    const copy = { ...data };
    const updated = addSection(data, {
      name: name ?? generatedName,
      title: title.trim(),
    });

    try {
      const savedData = await save(updated);
      props.onCreate(savedData);
    } catch (err) {
      logger.error("SectionCreate", err);
    }
  };

  const onBlurName = (e) => {
    const input = e.target;
    const newName = input.value.trim();

    // Validate it is unique
    if (data.sections.find((s) => s.name === newName)) {
      input.setCustomValidity(`Name '${newName}' already exists`);
    } else {
      input.setCustomValidity("");
    }
    setName(newName);
  };

  const onChangeTitle = (e) => {
    const input = e.target;
    const newTitle = input.value;
    const generatedName = camelCase(newTitle).trim();
    let newName = generatedName;

    let i = 1;
    while (data.sections.find((s) => s.name === newName)) {
      newName = generatedName + i;
      i++;
    }

    setGeneratedName(newName);
    setTitle(newTitle);
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
        <label className="govuk-label govuk-label--s" htmlFor="section-title">
          Title
        </label>
        <span className="govuk-hint">
          The text displayed on the page above the main title.
        </span>
        <input
          className="govuk-input"
          id="section-title"
          name="title"
          type="text"
          required
          value={title || ""}
          onChange={onChangeTitle}
        />
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="section-name">
          Name
        </label>
        <span className="govuk-hint">
          This is used as a namespace in the JSON output for all pages in this
          section. Use `camelCasing` e.g. checkBeforeStart or personalDetails.
        </span>
        <input
          className="govuk-input"
          id="section-name"
          name="name"
          type="text"
          required
          pattern="^\S+"
          defaultValue={name || generatedName || ""}
          onBlur={onBlurName}
        />
      </div>

      <button className="govuk-button" type="submit">
        Save
      </button>
    </form>
  );
};

export default SectionCreate;
