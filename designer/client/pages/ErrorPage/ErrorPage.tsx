import React, { ReactElement } from "react";
import { withRouter, useLocation } from "react-router-dom";
import { BackLink } from "../../components/BackLink";
import { i18n } from "../../i18n";
import "./ErrorPage.scss";

interface Props {
  history: any;
  location: any;
}

export function ErrorPage({ history, location }: Props): ReactElement {
  const crashReportUrl = `/error/crashreport/${location.state.id}`;
  const goBack = (event) => {
    event.preventDefault();
    history.goBack();
  };

  return (
    <div className="govuk-width-container error-summary">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <BackLink onClick={goBack}>{i18n("Back to Designer")}</BackLink>
          <h1 className="govuk-heading-xl govuk-heading-xl__lowmargin">
            Sorry there is a problem with the service
          </h1>
          <p className="govuk-body">
            An error occurred while saving the component.
          </p>
          <p className="govuk-body">
            We saved the last valid version of your form. Return to the designer
            to continue.
          </p>
          <p className="govuk-body">
            So we can check what went wrong, complete the following:
          </p>
          <ul className="govuk-list govuk-list--bullet govuk-list--spaced">
            <li>
              <a href={crashReportUrl} download className="govuk-link">
                download your crash report
              </a>
            </li>
            <li>
              <a
                href="https://github.com/XGovFormBuilder/digital-form-builder/issues"
                className="govuk-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                create an issue on Github
              </a>{" "}
              with details of what you were doing when this error occurred, and
              your crash report as an attachment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default withRouter(ErrorPage);
