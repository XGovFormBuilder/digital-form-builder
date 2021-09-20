import React from "react";
import { ValidationErrors } from "./types";
import { Input } from "@govuk-jsx/input";

type Props = {
  customFields: string;
  errors: ValidationErrors;
};

const FreshdeskEdit = ({ customFields = "", errors }: Props) => (
  <Input
    id="freshdesk-customFields"
    name="freshdesk-customFields"
    label={{
      className: "govuk-label--s",
      children: ["Freshdesk customFields"],
    }}
    defaultValue={customFields}
    pattern="^\S+"
    errorMessage={
      errors?.customFields
        ? { children: errors?.customFields.children }
        : undefined
    }
  />
);

export default FreshdeskEdit;
