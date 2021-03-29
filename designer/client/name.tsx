import React from "react";
import { ErrorMessage } from "./components/ErrorMessage";
import { isEmpty } from "./helpers";
import { withI18nRef, I18n } from "./i18n";

type Props = {
  updateModel?: (arg0: any) => {} | null | undefined;
  hint: string | null | undefined;
  name: string;
  id: string;
  labelText: string;
  i18n: I18n;
};

type State = {
  name: string | undefined;
  errors: any;
};

export class Name extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { name } = props;

    this.state = {
      name: name,
      errors: {},
    };
  }

  validate = () => {
    const name = this.state.name || "";
    const errors = this.validateName(name);
    this.setState({ errors });
    return errors;
  };

  validateName = (name) => {
    const { id, i18n, labelText } = this.props;
    const errors: any = {};
    const nameIsEmpty = isEmpty(name);
    const nameHasSpace = /\s/g.test(name);
    if (nameHasSpace) {
      errors.name = {
        href: `#${id}`,
        children: i18n("name.errors.whitespace"),
      };
    } else if (nameIsEmpty) {
      errors.name = {
        href: `#${id}`,
        children: i18n("errors.field", { field: labelText }),
      };
    }
    return errors;
  };

  onChangeName = (event: any) => {
    const inputValue = event.target.value;
    const errors = this.validateName(inputValue);
    this.setState(
      {
        name: inputValue,
        errors,
      },
      () => this.updateGlobalState()
    );
  };

  updateGlobalState = () => {
    const { updateModel } = this.props;
    const { name, errors } = this.state;
    if (updateModel && !errors?.name) {
      updateModel(name);
    }
  };

  render() {
    const { id, labelText, hint, i18n } = this.props;
    const { name, errors } = this.state;

    return (
      <div
        className={`govuk-form-group ${
          errors?.name ? "govuk-form-group--error" : ""
        }`}
      >
        <label className="govuk-label govuk-label--s" htmlFor={id}>
          {labelText}
        </label>
        <span className="govuk-hint">{hint || i18n("name.hint")}</span>
        {errors?.name && <ErrorMessage>{errors?.name.children}</ErrorMessage>}
        <input
          className={`govuk-input govuk-input--width-20 ${
            errors?.name ? "govuk-input--error" : ""
          }`}
          id={id}
          name="name"
          type="text"
          pattern="^\S+"
          value={name}
          onChange={this.onChangeName}
        />
      </div>
    );
  }
}

export default withI18nRef(Name);
