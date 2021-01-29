import React, { FunctionComponent } from "react";
import { i18n } from "../../i18n";

export const ErrorMessage: FunctionComponent = ({ children, ...props }) => {
  return (
    <span className="govuk-error-message" {...props}>
      <span className="govuk-visually-hidden">{i18n("error")}</span> {children}
    </span>
  );
};
