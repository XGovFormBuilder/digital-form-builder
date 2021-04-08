import React, { ReactElement } from "react";
import { withRouter } from "react-router-dom";
import { BackLink } from "../../components/BackLink";
import { i18n } from "../../i18n";
import "./ErrorPage.scss";

interface Props {
  history: any;
  location: any;
}

export function SaveError({ history, location }: Props): ReactElement {
  const crashReportUrl = `/error/crashreport/${location.state.id}`;
  const goBack = (event) => {
    event.preventDefault();
    history.push(`designer/${location.state.id}`);
  };

  return (
    <div className="govuk-width-container error-summary">
      <div className="govuk-main-wrapper govuk-main-wrapper--l">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <BackLink onClick={goBack}>{i18n("Back to Designer")}</BackLink>
            <h1 className="govuk-heading-xl govuk-heading-xl__lowmargin">
              {i18n("saveErrorPage.sorry")}
            </h1>
            <p className="govuk-body">{i18n("saveErrorPage.error")}</p>
            <p className="govuk-body">{i18n("saveErrorPage.hint")}</p>
            <p className="govuk-body">{i18n("saveErrorPage.report")}</p>
            <ul className="govuk-list govuk-list--bullet govuk-list--spaced">
              <li>
                <a href={crashReportUrl} download className="govuk-link">
                  {i18n("saveErrorPage.downloadCrashReport")}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/XGovFormBuilder/digital-form-builder/issues"
                  className="govuk-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i18n("saveErrorPage.createIssue")}
                </a>{" "}
                {i18n("saveErrorPage.createIssueHint")}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(SaveError);
