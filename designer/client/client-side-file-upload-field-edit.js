import React, { useContext, useEffect } from "react";
import { CssClasses } from "./components/CssClasses";
import { ComponentContext } from "./reducers/component/componentReducer";
import { i18n } from "./i18n";
import { Actions } from "./reducers/component/types";

export function ClientSideFileUploadFieldEdit({ context = ComponentContext }) {
  const { state, dispatch } = useContext(context);
  const { selectedComponent } = state;
  const { options = {} } = selectedComponent;
  const { hideScript = true, showNoScriptWarning = false } = options;

  useEffect(() => {
    console.log("Component rerendered");
  }, [showNoScriptWarning]);

  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          {i18n("common.detailsLink.title")}
        </span>
      </summary>
      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-maxFiles"
        >
          {i18n("clientSideFileUploadFieldEditPage.maxFiles.title")}
        </label>
        <span className="govuk-hint">
          {i18n("clientSideFileUploadFieldEditPage.maxFiles.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-maxFiles"
          name="options.dropzoneConfig.maxFiles"
          value={
            (options.dropzoneConfig && options.dropzoneConfig.maxFiles) || ""
          }
          type="number"
          required={true}
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_MAX_FILE_UPLOAD_AMOUNT,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-parallelUploads"
        >
          {i18n("clientSideFileUploadFieldEditPage.parallelUploads.title")}
        </label>
        <span className="govuk-hint">
          {i18n("clientSideFileUploadFieldEditPage.parallelUploads.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-parallelUploads"
          name="options.dropzoneConfig.parallelUploads"
          value={
            (options.dropzoneConfig &&
              options.dropzoneConfig.parallelUploads) ||
            ""
          }
          required={true}
          type="number"
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_PARALLEL_UPLOAD_AMOUNT,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-maxFilesize"
        >
          {i18n("clientSideFileUploadFieldEditPage.maxFilesize.title")}
        </label>
        <span className="govuk-hint">
          {i18n("clientSideFileUploadFieldEditPage.maxFilesize.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-maxFilesize"
          name="options.dropzoneConfig.maxFilesize"
          value={
            (options.dropzoneConfig && options.dropzoneConfig.maxFilesize) || ""
          }
          required={true}
          type="number"
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_MAX_FILE_SIZE,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-minimumRequiredFiles"
        >
          {i18n("clientSideFileUploadFieldEditPage.minimumRequiredFiles.title")}
        </label>
        <span className="govuk-hint">
          {i18n(
            "clientSideFileUploadFieldEditPage.minimumRequiredFiles.helpText"
          )}
        </span>
        <input
          className="govuk-input govuk-input--width-3"
          data-cast="number"
          id="field-schema-minimumRequiredFiles"
          name="options.minimumRequiredFiles"
          value={options.minimumRequiredFiles || ""}
          required={true}
          type="number"
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_MIN_REQUIRED_FILES,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-acceptedFiles"
        >
          {i18n("clientSideFileUploadFieldEditPage.acceptedFiles.title")}
        </label>
        <span className="govuk-hint">
          {i18n("clientSideFileUploadFieldEditPage.acceptedFiles.helpText")}
        </span>
        <input
          className="govuk-input govuk-input--width-30"
          data-cast="text"
          id="field-schema-acceptedFiles"
          name="options.dropzoneConfig.acceptedFiles"
          value={
            (options.dropzoneConfig && options.dropzoneConfig.acceptedFiles) ||
            ""
          }
          required={true}
          type="text"
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_OPTIONS_ACCEPTED_FILES,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-checkboxes govuk-form-group">
        <label
          className="govuk-label govuk-label--s"
          htmlFor="field-schema-showNoScriptWarning"
        >
          {i18n("clientSideFileUploadFieldEditPage.showNoScriptWarning.title")}
        </label>
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id="field-schema-showNoScriptWarning"
            name="options.showNoScriptWarning"
            type="checkbox"
            checked={showNoScriptWarning}
            onChange={(e) =>
              dispatch({
                type: Actions.EDIT_OPTIONS_SHOW_SCRIPT_WARNING,
                payload: !showNoScriptWarning,
              })
            }
          />
          <label
            className="govuk-label govuk-checkboxes__label"
            htmlFor="field-schema-showNoScriptWarning"
          >
            {i18n(
              "clientSideFileUploadFieldEditPage.showNoScriptWarning.title"
            )}
          </label>
          <span className="govuk-hint govuk-checkboxes__hint">
            {i18n(
              "clientSideFileUploadFieldEditPage.showNoScriptWarning.helpText"
            )}
          </span>
        </div>
      </div>
    </details>
  );
}
