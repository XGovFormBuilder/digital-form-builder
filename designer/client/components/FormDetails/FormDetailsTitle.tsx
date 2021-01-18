import React, { ChangeEvent } from "react";
import { Input } from "@govuk-jsx/input";
import { i18n } from "../../i18n";

type Props = {
  errors: any;
  handleTitleInputBlur: (event: ChangeEvent<HTMLInputElement>) => void;
  title: string;
};
export const FormDetailsTitle = (props: Props) => {
  const { title, errors, handleTitleInputBlur } = props;

  return (
    <Input
      id="form-title"
      name="title"
      label={{
        className: "govuk-label--s",
        children: [i18n("Title")],
      }}
      onBlur={handleTitleInputBlur}
      defaultValue={title}
      errorMessage={
        errors?.title ? { children: errors.title.children } : undefined
      }
    />
  );
};
