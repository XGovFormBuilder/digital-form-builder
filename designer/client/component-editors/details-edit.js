import React, { useContext, useState } from "react";
import { ComponentContext } from "../reducers/component/componentReducer";
import { Actions } from "./../reducers/component/types";

import { validateNotEmpty } from "../validations";

export function DetailsEdit({ context }) {
  const [{ selectedComponent, shouldValidate }, dispatch] = useContext(
    !!context ? context : ComponentContext
  );

  return (
    <div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="details-title">
          Title
        </label>
        <input
          className="govuk-input"
          id="details-title"
          name="title"
          value={selectedComponent.title}
          required
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_TITLE,
              payload: e.target.value,
            })
          }
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="details-content">
          Content
        </label>
        <span className="govuk-hint">
          The content can include HTML and the `govuk-prose-scope` css class is
          available. Use this on a wrapping element to apply default govuk
          styles.
        </span>
        <textarea
          className="govuk-textarea"
          id="details-content"
          name="content"
          defaultValue={selectedComponent.content}
          rows="10"
          required
          onChange={(e) =>
            dispatch({
              type: Actions.EDIT_CONTENT,
              payload: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}
