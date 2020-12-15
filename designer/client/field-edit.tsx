import React, { memo, useContext, useLayoutEffect, useState } from "react";
import { ComponentTypes } from "@xgovformbuilder/model";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";
import { Textarea } from "@govuk-jsx/textarea";
import { withI18n } from "./i18n";

function FieldEdit({ i18n, context = ComponentContext }) {
  const [{ selectedComponent }, dispatch] = useContext(context);

  const {
    name,
    title = "",
    hint = "",
    attrs,
    type,
    options = {},
    nameHasError = false,
  } = selectedComponent;
  const { hideTitle = false, optionalText = false, required = true } = options;
  const isFileUploadField = selectedComponent.type === "FileUploadField";

  return (
    <div>
      <div data-test-id="standard-inputs">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="field-title">
            Title
          </label>
          <span className="govuk-hint">
            This is the title text displayed on the page
          </span>
          <input
            className="govuk-input"
            id="field-title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => {
              dispatch({
                type: Actions.EDIT_TITLE,
                payload: e.target.value,
              });
            }}
          />
        </div>
        <Textarea
          id="field-hint"
          name="hint"
          rows={2}
          label={{
            className: "govuk-label--s",
            children: ["Help Text (optional)"],
          }}
          hint={{
            children: ["Text can include HTML"],
          }}
          required={false}
          value={hint}
          onChange={(e) => {
            dispatch({
              type: Actions.EDIT_HELP,
              payload: e.target.value,
            });
          }}
          {...attrs}
        />
        <div className="govuk-checkboxes govuk-form-group">
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options-hideTitle"
              name="options.hideTitle"
              type="checkbox"
              checked={hideTitle}
              onChange={(e) =>
                dispatch({
                  type: Actions.EDIT_OPTIONS_HIDE_TITLE,
                  payload: e.target.checked,
                })
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-hideTitle"
            >
              Hide title
            </label>
            <span className="govuk-hint">Hide the title of the component</span>
          </div>
        </div>
        <div
          className={`govuk-form-group ${
            nameHasError ? "govuk-form-group--error" : ""
          }`}
        >
          <label className="govuk-label govuk-label--s" htmlFor="field-name">
            {i18n("component.name")}
          </label>
          {nameHasError && (
            <span className="govuk-error-message">
              <span className="govuk-visually-hidden">{i18n("error")}</span>{" "}
              {i18n("name.errors.whitespace")}
            </span>
          )}
          <span className="govuk-hint">{i18n("name.hint")}</span>
          <input
            className={`govuk-input govuk-input--width-20 ${
              nameHasError ? "govuk-input--error" : ""
            }`}
            id="field-name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => {
              dispatch({
                type: Actions.EDIT_NAME,
                payload: e.target.value,
              });
            }}
          />
        </div>
        <div className="govuk-checkboxes govuk-form-group">
          <div className="govuk-checkboxes__item">
            <input
              type="checkbox"
              id="field-options-required"
              className={`govuk-checkboxes__input ${
                isFileUploadField ? "disabled" : ""
              }`}
              name="options.required"
              checked={!required}
              onChange={(e) =>
                dispatch({
                  type: Actions.EDIT_OPTIONS_REQUIRED,
                  payload: !e.target.checked,
                })
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-required"
            >
              {`Make ${
                ComponentTypes.find(
                  (componentType) => componentType.name === type
                )?.title ?? ""
              } optional`}
            </label>
            {isFileUploadField && (
              <span className="govuk-hint govuk-checkboxes__label">
                All file upload fields are optional to mitigate possible upload
                errors
              </span>
            )}
          </div>
        </div>
        <div
          className="govuk-checkboxes govuk-form-group"
          data-test-id="field-options.optionalText-wrapper"
          hidden={required}
        >
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options-optionalText"
              name="options.optionalText"
              type="checkbox"
              checked={optionalText}
              onChange={(e) =>
                dispatch({
                  type: Actions.EDIT_OPTIONS_HIDE_OPTIONAL,
                  payload: e.target.checked,
                })
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-optionalText"
            >
              Hide &apos;(Optional)&apos; text
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(withI18n(FieldEdit));
