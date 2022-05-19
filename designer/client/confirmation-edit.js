import React from "react";
import Editor from "./editor";
import { clone } from "@xgovformbuilder/model";
import { DataContext } from "./context";
import logger from "../client/plugins/logger";
import { Input } from "@govuk-jsx/input";

class ConfirmationEdit extends React.Component {
  static contextType = DataContext;

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new window.FormData(form);
    const { save, data } = this.context;
    const copy = clone(data);

    copy.specialPages = {
      confirmationPage: {
        customText: {
          title: (copy.confirmationText = formData.get("title")),
          nextSteps: (copy.confirmationText = formData.get("nextSteps")),
        },
      },
    };

    try {
      const savedData = await save(copy);
      this.props.onCreate({ data: savedData });
    } catch {
      logger.error("ConfirmationEdit", err);
    }
  };

  render() {
    const { data } = this.context;
    const { specialPages } = data;

    return (
      <div className="govuk-body">
        <form onSubmit={(e) => this.onSubmit(e)} autoComplete="off">
          <div className="govuk-checkboxes govuk-form-group">
            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
              <p className="govuk-fieldset__heading">Edit Confirmation text?</p>
              <span className="govuk-hint">
                This will edit the Title for the confirmation page
              </span>
              <Input
                name="title"
                value={specialPages?.confirmationPage.customText.title}
              />
              <span className="govuk-hint">
                This will edit the Next Steps text of the confirmation pages
              </span>
              <Input
                name="nextSteps"
                value={specialPages?.confirmationPage.customText.nextSteps}
              />
            </legend>
          </div>

          <button className="govuk-button" type="submit">
            Save
          </button>
        </form>
      </div>
    );
  }
}

export default ConfirmationEdit;
