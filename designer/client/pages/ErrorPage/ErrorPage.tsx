import React, { ReactElement } from "react";
import { withRouter, useLocation } from "react-router-dom";
import "./ErrorPage.scss";

interface Props {
  history: any;
  location: any;
}

export function ErrorPage({ history, location }: Props): ReactElement {
  const crashReportUrl = `/error/crashreport/${location.state.id}`;
  return (
    <div className="error-summary">
      <h1 className="govuk-heading-xl govuk-heading-xl__lowmargin">
        Sorry there is a problem with the service
      </h1>
      <p className="govuk-body">
        An error occurred while processing your form.
      </p>
      <p className="govuk-body">
        We saved the last version of your form. Refresh the Designer browser
        page to continue.
      </p>
      <p className="govuk-body">
        So we can check what went wrong, complete the following:
      </p>
      <ul className="govuk-list govuk-list--bullet">
        <li>
          <a href={crashReportUrl} download className="govuk-link">
            download your crash report
          </a>
        </li>
        <li>
          create an issue on{" "}
          <a
            href="/https://github.com/XGovFormBuilder/digital-form-builder/issues"
            className="govuk-link"
          >
            Github
          </a>{" "}
          attaching your crash report and as much details as possible
        </li>
      </ul>
    </div>
  );
}

export default withRouter(ErrorPage);
