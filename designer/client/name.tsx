import React from "react";
import { withI18n } from "./i18n";

type Props = {
  updateModel: (arg0: any) => {} | null | undefined;
  component: any | null | undefined;
  hint: string | null | undefined;
  name: string;
  id: string;
  labelText: string;
  i18n: (arg0: string) => any;
};

type State = {
  name: string | undefined;
  nameHasError: boolean;
};

export class Name extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { name, component } = props;

    this.state = {
      name: component?.name ?? name,
      nameHasError: false,
    };
  }

  onChangeName = (event: any) => {
    const inputValue = event.target.value;
    let nameHasError = !inputValue || /\s/g.test(inputValue);
    this.setState(
      {
        name: inputValue,
        nameHasError,
      },
      () => this.updateGlobalState()
    );
  };

  updateGlobalState = () => {
    const { updateModel, component } = this.props;
    const { name, nameHasError } = this.state;
    if (updateModel && !nameHasError) {
      updateModel({ ...component, name });
    }
  };

  render() {
    const { id, labelText, hint, i18n } = this.props;
    const { name, nameHasError } = this.state;

    return (
      <div
        className={`govuk-form-group ${
          nameHasError ? "govuk-form-group--error" : ""
        }`}
      >
        <label className="govuk-label govuk-label--s" htmlFor={id}>
          {labelText}
        </label>
        <span className="govuk-hint">{hint || i18n("name.hint")}</span>
        {nameHasError && (
          <span className="govuk-error-message">
            <span className="govuk-visually-hidden">{i18n("error")}</span>{" "}
            {i18n("name.errors.whitespace")}
          </span>
        )}
        <input
          className={`govuk-input govuk-input--width-20 ${
            nameHasError ? "govuk-input--error" : ""
          }`}
          id={id}
          name="name"
          type="text"
          required
          pattern="^\S+"
          value={name}
          onChange={this.onChangeName}
        />
      </div>
    );
  }
}

export default withI18n(Name);
