import React, {
  Component,
  MouseEvent,
  ChangeEvent,
  FormEvent,
  ReactNode,
} from "react";
import { clone } from "@xgovformbuilder/model";
import NotifyEdit from "./notify-edit";
import EmailEdit from "./email-edit";
import { Input } from "@govuk-jsx/input";
import WebhookEdit from "./webhook-edit";
import {
  OutputType,
  OutputConfiguration,
  Output,
  ValidationErrors,
} from "./types";
import { validateNotEmpty, hasValidationErrors } from "../validations";
import ErrorSummary from "../error-summary";
import { DataContext } from "../context";

type State = {
  outputType: OutputType;
  errors: ValidationErrors;
};

type Props = {
  onEdit: ({ data: any }) => void; // TODO: type
  onCancel: (event: MouseEvent<HTMLAnchorElement>) => void;
  data: any; // TODO: type
  output: Output;
};

class OutputEdit extends Component<Props, State> {
  static contextType = DataContext;

  constructor(props: Props) {
    super(props);
    this.state = {
      outputType: props.output?.type ?? OutputType.Email,
      errors: {},
    };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { save } = this.context;
    let output = this.props.output || { name: "", type: "" };
    const form = event.currentTarget;
    const formData = new window.FormData(form);
    const { data } = this.props;
    const copy = clone(data);
    const outputType: OutputType =
      (formData.get("output-type") as OutputType) || output.type;
    const outputName = formData.get("output-name") as string;
    const outputTitle = formData.get("output-title") as string;
    let validationErrors = this.validate(formData, outputType);

    if (hasValidationErrors(validationErrors)) return;

    let outputIndex: number = -1;

    if (output.name) {
      outputIndex = data.outputs.indexOf(output);
    }

    let outputConfiguration: OutputConfiguration =
      output.outputConfiguration || {};

    switch (outputType) {
      case OutputType.Email:
        outputConfiguration = {
          emailAddress: formData.get("email-address") as string,
        };
        break;
      case OutputType.Notify:
        outputConfiguration = {
          personalisation: formData
            .getAll("personalisation")
            .map((t) => (t as string).trim()),
          templateId: formData.get("template-id") as string,
          apiKey: formData.get("api-key") as string,
          emailField: formData.get("email-field") as string,
        };
        break;
      case OutputType.Webhook:
        outputConfiguration = {
          url: formData.get("webhook-url") as string,
        };
        break;
    }

    output = {
      name: outputName.trim(),
      title: outputTitle.trim(),
      type: outputType,
      outputConfiguration,
    };

    if (outputIndex >= 0) {
      copy.outputs[outputIndex] = output;
    } else {
      copy.outputs = copy.outputs || [];
      copy.outputs.push(output);
    }

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  validate = (formData: FormData, outputType: OutputType) => {
    const outputName = formData.get("output-name") as string;
    const outputTitle = formData.get("output-title") as string;
    const errors: ValidationErrors = {};

    validateNotEmpty(
      "output-title",
      "output title",
      "title",
      outputTitle,
      errors
    );

    validateNotEmpty("output-name", "output name", "name", outputName, errors);

    switch (outputType) {
      case OutputType.Email:
        let emailAddress = formData.get("email-address") as string;
        validateNotEmpty(
          "email-address",
          "email address",
          "email",
          emailAddress,
          errors
        );
        break;
      case OutputType.Notify:
        let templateId = formData.get("template-id") as string;
        let apiKey = formData.get("api-key") as string;
        let emailField = formData.get("email-field") as string;
        validateNotEmpty(
          "template-id",
          "template id",
          "templateId",
          templateId,
          errors
        );
        validateNotEmpty("api-key", "API key", "apiKey", apiKey, errors);
        validateNotEmpty(
          "email-field",
          "email address",
          "email",
          emailField,
          errors
        );
        break;
      case OutputType.Webhook:
        let url = formData.get("webhook-url") as string;
        if (!url) {
          errors.url = {
            href: "#webhook-url",
            children: "Not a valid url",
          };
        }
        break;
    }

    this.setState({ errors: errors });

    return errors;
  };

  onChangeOutputType = (event: ChangeEvent<HTMLSelectElement>) => {
    const outputType = event.currentTarget.value as OutputType;
    this.setState({ outputType, errors: {} });
  };

  onClickDelete = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, output } = this.props;
    const { save } = this.context;
    const copy = clone(data);
    const outputIndex = data.outputs.indexOf(output);
    copy.outputs.splice(outputIndex, 1);

    save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  render() {
    const { outputType, errors } = this.state;
    const { data, output } = this.props;
    let outputEdit: ReactNode;

    if (outputType === OutputType.Notify) {
      outputEdit = (
        <NotifyEdit
          data={data}
          output={output}
          onEdit={this.props.onEdit}
          errors={errors}
        />
      );
    } else if (outputType === OutputType.Email) {
      outputEdit = <EmailEdit output={output} errors={errors} />;
    } else if (outputType === OutputType.Webhook) {
      outputEdit = (
        <WebhookEdit
          url={output?.outputConfiguration?.["url"]}
          errors={errors}
        />
      );
    }
    return (
      <>
        {hasValidationErrors(errors) && (
          <ErrorSummary errorList={Object.values(errors)} />
        )}
        <form onSubmit={this.onSubmit} autoComplete="off">
          {this.props.onCancel && (
            <a
              className="govuk-back-link"
              href="#"
              onClick={(e) => this.props.onCancel(e)}
            >
              Back
            </a>
          )}
          <Input
            id="output-title"
            name="output-title"
            label={{
              className: "govuk-label--s",
              children: ["Title"],
            }}
            defaultValue={output?.title ?? ""}
            errorMessage={
              errors?.title ? { children: errors?.title.children } : undefined
            }
          />
          <Input
            id="output-name"
            name="output-name"
            label={{
              className: "govuk-label--s",
              children: ["Name"],
            }}
            pattern="^\S+"
            defaultValue={output?.name ?? ""}
            errorMessage={
              errors?.name ? { children: errors?.name.children } : undefined
            }
          />

          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="output-type">
              Output type
            </label>
            <select
              className="govuk-select"
              id="output-type"
              name="output-type"
              disabled={!!output?.type}
              value={outputType}
              onChange={this.onChangeOutputType}
            >
              <option value="email">Email</option>
              <option value="notify">Email via GOVUK Notify</option>
              <option value="webhook">Webhook</option>
            </select>
          </div>

          {outputEdit}
          <div className="govuk-form-group">
            <button className="govuk-button" type="submit">
              Save
            </button>
          </div>
          {output && (
            <div className="govuk-form-group">
              <a onClick={this.onClickDelete} href="#">
                Delete
              </a>
            </div>
          )}
        </form>
      </>
    );
  }
}

export default OutputEdit;
