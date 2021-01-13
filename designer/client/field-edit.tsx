import React, { useContext } from "react";
import { ComponentTypes } from "@xgovformbuilder/model";
import { ComponentContext } from "./reducers/component/componentReducer";
import { Actions } from "./reducers/component/types";
import { Textarea } from "@govuk-jsx/textarea";
import { Input } from "@govuk-jsx/input";
import { i18n } from "./i18n";

export function FieldEdit() {
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent, errors } = state;

  const { name, title, hint, attrs, type, options = {} } = selectedComponent;
  const { hideTitle = false, optionalText = false, required = true } = options;
  const isFileUploadField = selectedComponent.type === "FileUploadField";
  return (
    <div>
      <div data-test-id="standard-inputs">
        <Input
          id="field-title"
          name="title"
          label={{
            className: "govuk-label--s",
            children: ["Title"],
          }}
          hint={{
            children: ["This is the title text displayed on the page"],
          }}
          value={title || ""}
          onChange={(e) => {
            dispatch({
              type: Actions.EDIT_TITLE,
              payload: e.target.value,
            });
          }}
          errorMessage={
            errors?.title
              ? { children: i18n(errors.title[0], errors.title[1]) }
              : undefined
          }
        />
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
            errors?.name ? "govuk-form-group--error" : ""
          }`}
        >
          <label className="govuk-label govuk-label--s" htmlFor="field-name">
            {i18n("component.name")}
          </label>
          {errors?.name && (
            <span className="govuk-error-message">
              <span className="govuk-visually-hidden">{i18n("error")}</span>{" "}
              {i18n("name.errors.whitespace")}
            </span>
          )}
          <span className="govuk-hint">{i18n("name.hint")}</span>
          <input
            className={`govuk-input govuk-input--width-20 ${
              errors?.name ? "govuk-input--error" : ""
            }`}
            id="field-name"
            name="name"
            type="text"
            value={name || ""}
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
export default FieldEdit;
