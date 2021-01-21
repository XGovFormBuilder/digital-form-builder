import React, { ReactElement, useState } from "react";
import { withI18n } from "../../i18n";
import { withRouter } from "react-router-dom";
import { Radios } from "@govuk-jsx/radios";
import "./LandingPage.scss";

interface Props {
  i18n(text: string): string;
  history: any;
}

export function LandingChoice({ i18n, history }: Props): ReactElement {
  const [createNewFrom, setCreateNewForm] = useState(true);

  const handleNext = function () {
    if (createNewFrom) history.push("/new");
    else history.push("/choose-existing");
  };

  const handleChange = (e) => {
    setCreateNewForm(e.target.value == "true");
  };

  return (
    <div className="new-config">
      <div>
        <h1 className="govuk-heading-l">Design and prototype forms</h1>
        <p className="govuk-body">
          Use the form designer to easily create forms test ideas and get user
          feedback
        </p>
        <Radios
          className="govuk-radios--inline"
          name="newOrExisting"
          value={createNewFrom}
          onChange={handleChange}
          required={true}
          fieldset={{
            legend: {
              isPageHeading: true,
              children: ["Select an option"],
            },
          }}
          items={[
            {
              children: ["Create a new form"],
              value: true,
            },
            {
              children: ["Open an existing form"],
              value: false,
            },
          ]}
        />
        <button
          className="govuk-button govuk-button--start"
          onClick={handleNext}
          title="Next"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default withRouter(withI18n(LandingChoice));
