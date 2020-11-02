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
import WebhookEdit from "./webhook-edit";

import { OutPutType, OutputConfiguration, Output } from "./types";

type State = {
  outputType: OutPutType;
};

type Props = {
  onEdit: ({ data: any }) => void; // TODO: type
  onCancel: (event: MouseEvent<HTMLAnchorElement>) => void;
  data: any; // TODO: type
  output: Output;
};

class OutputEdit extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { outputType: props.output?.type ?? OutPutType.Email };
  }

  onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let output = this.props.output || { name: "", type: "" };
    const form = event.currentTarget;
    const formData = new window.FormData(form);
    const { data } = this.props;
    const copy = clone(data);
    const outputType: OutPutType =
      (formData.get("output-type") as OutPutType) || output.type;
    const outputName = formData.get("output-name") as string;
    const outputTitle = formData.get("output-title") as string;

    let outputIndex: number = -1;

    if (output.name) {
      outputIndex = data.outputs.indexOf(output);
    }

    let outputConfiguration: OutputConfiguration =
      output.outputConfiguration || {};

    switch (outputType) {
      case OutPutType.Email:
        outputConfiguration = {
          emailAddress: formData.get("email-address") as string,
        };
        break;
      case OutPutType.Notify:
        outputConfiguration = {
          personalisation: formData
            .getAll("personalisation")
            .map((t) => (t as string).trim()),
          templateId: formData.get("template-id") as string,
          apiKey: formData.get("api-key") as string,
          emailField: formData.get("email-field") as string,
        };
        break;
      case OutPutType.Webhook:
        outputConfiguration = {
          url: formData.get("webhook-url") as string,
        };
        break;
    }

    output = {
      name: outputName,
      title: outputTitle,
      type: outputType,
      outputConfiguration,
    };

    if (outputIndex >= 0) {
      copy.outputs[outputIndex] = output;
    } else {
      copy.outputs = copy.outputs || [];
      copy.outputs.push(output);
    }

    data
      .save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  onChangeOutputType = (event: ChangeEvent<HTMLSelectElement>) => {
    const outputType = event.currentTarget.value as OutPutType;
    this.setState({ outputType });
  };

  onClickDelete = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    if (!window.confirm("Confirm delete")) {
      return;
    }

    const { data, output } = this.props;
    const copy = clone(data);
    const outputIndex = data.outputs.indexOf(output);
    copy.outputs.splice(outputIndex, 1);

    data
      .save(copy)
      .then((data) => {
        this.props.onEdit({ data });
      })
      .catch((err: Error) => {
        console.error(err);
      });
  };

  render() {
    const state = this.state;
    const { data, output } = this.props;
    let outputEdit: ReactNode;

    if (state.outputType === OutPutType.Notify) {
      outputEdit = (
        <NotifyEdit data={data} output={output} onEdit={this.props.onEdit} />
      );
    } else if (state.outputType === OutPutType.Email) {
      outputEdit = <EmailEdit output={output} />;
    } else if (state.outputType === OutPutType.Webhook) {
      outputEdit = <WebhookEdit url={output?.outputConfiguration?.["url"]} />;
    }

    return (
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
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="output-title">
            Title
          </label>
          <input
            className="govuk-input"
            id="output-name"
            name="output-title"
            type="text"
            required
            defaultValue={output?.title ?? ""}
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="output-name">
            Name
          </label>
          <input
            className="govuk-input"
            id="output-name"
            name="output-name"
            type="text"
            required
            pattern="^\S+"
            defaultValue={output?.name ?? ""}
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--s" htmlFor="output-type">
            Output type
          </label>
          <select
            className="govuk-select"
            id="output-type"
            name="output-type"
            disabled={!!output?.type}
            value={state.outputType}
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
    );
  }
}

export default OutputEdit;
