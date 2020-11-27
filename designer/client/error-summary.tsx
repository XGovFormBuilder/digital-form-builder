import React, { useEffect, useRef } from "react";

interface ErrorListItem {
  reactListKey?: string;
  href?: string;
  children: string;
}

interface ErrorSummaryProps {
  className: string;
  descriptionChildren: string;
  errorList: Array<ErrorListItem>;
  titleChildren;
}

function ErrorSummary({
  className,
  descriptionChildren,
  errorList,
  titleChildren = "There is a problem",
}: ErrorSummaryProps) {
  const errorSummaryRef = useRef();

  useEffect(() => {
    errorSummaryRef.current.focus();
  }, [errorList]);

  let description;
  if (descriptionChildren) {
    description = <p>{descriptionChildren}</p>;
  }

  return (
    <div
      className={`govuk-error-summary ${className || ""}`}
      aria-labelledby="error-summary-title"
      role="alert"
      tabIndex="-1"
      data-module="govuk-error-summary"
      ref={errorSummaryRef}
    >
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        {titleChildren}
      </h2>
      <div className="govuk-error-summary__body">
        {description}
        <ul className="govuk-list govuk-error-summary__list">
          {errorList.map((error, index) => (
            <li key={error.reactListKey || index}>
              {error.href ? (
                <a href={error.href}>{error.children}</a>
              ) : (
                <>{error.children}</>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export { ErrorSummary };
