import React from "react";
import { ValidationErrors } from "./types";
import { Input } from "@govuk-jsx/input";

type Props = {
  savePerPageUrl: string;
  errors: ValidationErrors;
};

const SavePerPageEdit = ({ savePerPageUrl = "", errors }: Props) => (
  <Input
    id="save-per-page-url"
    name="save-per-page-url"
    label={{
      className: "govuk-label--s",
      children: ["Save per Page Webhook url"],
    }}
    defaultValue={savePerPageUrl}
    pattern="^\S+"
    errorMessage={
      errors?.savePerPageUrl
        ? { children: errors?.savePerPageUrl.children }
        : undefined
    }
  />
);

export default SavePerPageEdit;
