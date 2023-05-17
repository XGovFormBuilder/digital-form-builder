import React, { Component } from "react";

import NotifyEditItems from "./notify-edit-items";
import { Output, NotifyOutputConfiguration, ValidationErrors } from "./types";
import { Input } from "@govuk-jsx/input";
import { Checkboxes } from "@govuk-jsx/checkboxes";
import { ErrorMessage } from "@govuk-jsx/error-message";
import classNames from "classnames";
import { i18n } from "../i18n";
import { allInputs } from "../data/component/inputs";

type State = {
  emailFieldValue: string;
};

type Props = {
  data: any; // TODO: type
  output: Output;
  onEdit: ({ data: any }) => void;
  errors: ValidationErrors;
};

class NotifyEdit extends Component<Props, State> {
  usableKeys: { name: string; display: string }[];

  constructor(props: Props) {
    super(props);
    const { data } = this.props;

    this.usableKeys = allInputs(data)
      .filter((input) => input.type === "EmailAddressField")
      .map((input) => ({
        name: input.propertyPath || "",
        display: input.title || "",
      }));
    console.log(this.props.output.outputConfiguration);
    this.state = {
      emailFieldValue: this.props.output.outputConfiguration?.emailField ?? "",
    };
  }

  isEmailFieldStatic = () => {
    if (
      this.usableKeys.find((field) => this.state.emailFieldValue === field.name)
    ) {
      return false;
    }
    return true;
  };
  changeEmailFieldType = (event: React.MouseEvent) => {
    event.preventDefault();
    if (this.isEmailFieldStatic()) {
      this.setState({
        emailFieldValue: this.usableKeys[0]?.name ?? "",
      });
    } else {
      this.setState({
        emailFieldValue: "",
      });
    }
  };

  render() {
    const { data, output, onEdit, errors } = this.props;
    const { conditions, lists } = data;
    const outputConfiguration = (typeof output.outputConfiguration === "object"
      ? output.outputConfiguration
      : {
          templateId: "",
          apiKey: "",
          emailField: "",
          personalisation: [],
        }) as NotifyOutputConfiguration;

    const { templateId, apiKey, emailField } = outputConfiguration;
    const personalisation = outputConfiguration.personalisation;
    const values = [
      ...conditions.map((condition) => ({
        name: condition.name,
        display: condition.displayName,
      })),
      ...lists.map((list) => ({
        name: list.name,
        display: `${list.title} (List)`,
      })),
      ...this.usableKeys,
    ];

    return (
      <div className="govuk-body">
        <Input
          id="template-id"
          name="template-id"
          label={{
            className: "govuk-label--s",
            children: ["Template ID"],
          }}
          defaultValue={templateId}
          step="any"
          errorMessage={
            errors?.templateId
              ? { children: errors?.templateId.children }
              : undefined
          }
        />
        <Input
          id="api-key"
          name="api-key"
          label={{
            className: "govuk-label--s",
            children: ["API Key"],
          }}
          defaultValue={apiKey}
          step="any"
          errorMessage={
            errors?.apiKey ? { children: errors?.apiKey.children } : undefined
          }
        />
        <div
          className={classNames({
            "govuk-form-group": true,
            "govuk-form-group--error": errors?.email,
          })}
        >
          <label className="govuk-label govuk-label--s" htmlFor="email-field">
            Email field
          </label>
          {errors?.email && (
            <ErrorMessage>{errors?.email.children}</ErrorMessage>
          )}
          {!this.isEmailFieldStatic() ? (
            <>
              <select
                className={classNames({
                  "govuk-select": true,
                  "govuk-!-width-three-quarters": true,
                  "govuk-input--error": errors?.email,
                  "govuk-!-margin-right-2": true,
                })}
                id="email-field"
                name="email-field"
                defaultValue={emailField}
              >
                {this.usableKeys.map((value, i) => (
                  <option key={`${value.name}-${i}`} value={value.name}>
                    {value.display ?? value.name}
                  </option>
                ))}
              </select>
              <a
                role={"button"}
                href={"#"}
                onClick={(e) => this.changeEmailFieldType(e)}
              >
                Or enter an email address
              </a>
            </>
          ) : (
            <>
              <input
                className={classNames({
                  "govuk-input": true,
                  "govuk-!-width-three-quarters": this.usableKeys.length > 0,
                  "govuk-input--error": errors?.email,
                  "govuk-!-margin-right-2": true,
                })}
                id={"email-field"}
                name={"email-field"}
                type={"email"}
                defaultValue={emailField}
              />
              {this.usableKeys.length > 0 && (
                <a
                  role={"button"}
                  href={"#"}
                  onClick={(e) => this.changeEmailFieldType(e)}
                >
                  Or choose a field
                </a>
              )}
            </>
          )}
        </div>
        <NotifyEditItems
          items={personalisation}
          values={values}
          data={data}
          onEdit={onEdit}
        />
        <div className="govuk-form-group">
          <Checkboxes
            items={[
              {
                children: (
                  <strong>
                    {i18n("outputEdit.notifyEdit.includeReferenceTitle")}
                  </strong>
                ),
                hint: {
                  children: i18n("outputEdit.notifyEdit.includeReferenceHint"),
                },
                value: true,
              },
            ]}
            name="add-references-to-personalisation"
          />
        </div>
      </div>
    );
  }
}

export default NotifyEdit;
