import React, { useContext } from "react";
import { ComponentContext } from "./reducers/component/componentReducer";
import { ComponentTypes } from "@xgovformbuilder/model";
import { Actions } from "./reducers/component/types";
import { Textarea } from "@govuk-jsx/textarea";
import { Input } from "@govuk-jsx/input";
import { i18n } from "./i18n";
import { ErrorMessage } from "./components/ErrorMessage";

type Props = {
  isContentField?: boolean;
  isListField?: boolean;
};

export function FieldEdit({
  isContentField = false,
  isListField = false,
}: Props) {
  const { state, dispatch } = useContext(ComponentContext);
  const { selectedComponent, errors } = state;

  const { name, title, hint, attrs, type, options = {} } = selectedComponent;
  const {
    hideTitle = false,
    optionalText = false,
    required = true,
    exposeToContext = false,
    allowPrePopulation = false,
  } = options;
  const isFileUploadField = selectedComponent.type === "FileUploadField";
  const fieldTitle =
    ComponentTypes.find((componentType) => componentType.name === type)
      ?.title ?? "";
  return (
    <div>
      <div data-test-id="standard-inputs">
        <Input
          id="field-title"
          name="title"
          label={{
            className: "govuk-label--s",
            children: [i18n("common.titleField.title")],
          }}
          hint={{
            children: [i18n("common.titleField.helpText")],
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
            children: [i18n("common.helpTextField.title")],
          }}
          hint={{
            children: [i18n("common.helpTextField.helpText")],
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
              {i18n("common.hideTitleOption.title")}
            </label>
            <span className="govuk-hint govuk-checkboxes__hint">
              {i18n("common.hideTitleOption.helpText")}
            </span>
          </div>
        </div>
        <div
          className={`govuk-form-group ${
            errors?.name ? "govuk-form-group--error" : ""
          }`}
        >
          <label className="govuk-label govuk-label--s" htmlFor="field-name">
            {i18n("common.componentNameField.title")}
          </label>
          {errors?.name && (
            <ErrorMessage>{i18n("name.errors.whitespace")}</ErrorMessage>
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
        {!isContentField && (
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
                {i18n("common.componentOptionalOption.title", {
                  component:
                    ComponentTypes.find(
                      (componentType) => componentType.name === type
                    )?.title ?? "",
                })}
              </label>
              <span className="govuk-hint govuk-checkboxes__hint">
                {i18n("common.componentOptionalOption.helpText")}
              </span>
            </div>
          </div>
        )}
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
              {i18n("common.hideOptionalTextOption.title")}
            </label>
            <span className="govuk-hint govuk-checkboxes__hint">
              {i18n("common.hideOptionalTextOption.helpText")}
            </span>
          </div>
        </div>
        <div
          className="govuk-checkboxes govuk-form-group"
          data-test-id="field-options.exposeToContext-wrapper"
        >
          <div className="govuk-checkboxes__item">
            <input
              className="govuk-checkboxes__input"
              id="field-options-exposeToContext"
              name="options.exposeToContext"
              type="checkbox"
              checked={exposeToContext}
              onChange={(e) =>
                dispatch({
                  type: Actions.EDIT_OPTIONS_EXPOSE_TO_CONTEXT,
                  payload: e.target.checked,
                })
              }
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor="field-options-exposeToContext"
            >
              {i18n("common.exposeToContextOption.title")}
            </label>
            <span className="govuk-hint govuk-checkboxes__hint">
              {i18n("common.exposeToContextOption.helpText")}
            </span>
          </div>
        </div>
        {isListField && (
          <div className="govuk-checkboxes govuk-form-group">
            <div className="govuk-checkboxes__item">
              <input
                type="checkbox"
                id="field-options-allow-pre-population"
                className={`govuk-checkboxes__input`}
                name="options.allowPrePopulation"
                checked={allowPrePopulation}
                onChange={(e) =>
                  dispatch({
                    type: Actions.EDIT_OPTIONS_ALLOW_PRE_POPULATION,
                    payload: e.target.checked,
                  })
                }
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="field-options-allow-pre-population"
              >
                {i18n("common.allowPrePopulationOption.title", {
                  component:
                    ComponentTypes.find(
                      (componentType) => componentType.name === type
                    )?.title ?? "",
                })}
              </label>
              <span className="govuk-hint govuk-checkboxes__hint">
                {i18n("common.allowPrePopulationOption.helpText")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default FieldEdit;
