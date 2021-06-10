import React, { ReactElement, useState } from "react";
import { i18n } from "../../i18n";
import { withRouter } from "react-router-dom";
import { Radios } from "@govuk-jsx/radios";
import "./LandingPage.scss";

interface Props {
  history: any;
}

export function LandingChoice({ history }: Props): ReactElement {
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
      <div className="choice-wrapper">
        <h1 className="govuk-heading-xl govuk-heading-xl__lowmargin">
          {i18n("landingPage.choice.heading")}
        </h1>
        <p className="govuk-body">{i18n("landingPage.choice.intro")}</p>
        <Radios
          className="govuk-radios--inline"
          name="newOrExisting"
          value={createNewFrom}
          onChange={handleChange}
          required={true}
          fieldset={{
            legend: {
              isPageHeading: true,
              children: [i18n("landingPage.choice.hint")],
            },
          }}
          items={[
            {
              children: [i18n("landingPage.choice.newform")],
              value: true,
            },
            {
              children: [i18n("landingPage.choice.existing")],
              value: false,
            },
          ]}
        />
        <button
          className="govuk-button govuk-button--start"
          onClick={handleNext}
          title="Next"
        >
          {i18n("Next")}
        </button>
      </div>
    </div>
  );
}

export default withRouter(LandingChoice);
