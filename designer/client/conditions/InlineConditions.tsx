import React, { MouseEvent, ChangeEvent } from "react";
import classNames from "classnames";
import { ConditionsModel, clone, Item } from "@xgovformbuilder/model";

import InlineConditionsDefinition from "./InlineConditionsDefinition";
import InlineConditionsEdit from "./inline-conditions-edit";
import helpers from "./inline-condition-helpers";
import { DataContext } from "../context";
import ErrorSummary, { ErrorListItem } from "../error-summary";
import { i18n } from "../i18n";
import { ErrorMessage } from "../components/ErrorMessage";

interface Props {
  path: string;
  condition?: any;
  cancelCallback?: (event: MouseEvent) => void;
  conditionsChange?: (event: MouseEvent) => void;
}

interface State {
  editView?: boolean;
  conditions: ConditionsModel;
  fields: any;
  conditionString: any;
  validationErrors: ErrorListItem[];
}

const yesNoValues: Readonly<Item> = [
  {
    text: "Yes",
    value: true,
  },
  {
    text: "No",
    value: false,
  },
];

export class InlineConditions extends React.Component<Props, State> {
  static contextType = DataContext;

  constructor(props, context) {
    super(props, context);
    const { path, condition } = this.props;

    const conditions =
      condition && typeof condition.value === "object"
        ? ConditionsModel.from(condition.value)
        : new ConditionsModel();

    conditions.name &&= condition.displayName;

    this.state = {
      validationErrors: [],
      conditions: conditions,
      fields: this.fieldsForPath(path),
      conditionString: condition?.value,
    };
  }

  componentDidMount() {
    let value = this.context;
    console.log(this.context, value);
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.path !== prevProps.path) {
      const fields = this.fieldsForPath(this.props.path);

      this.setState({
        conditions: new ConditionsModel(),
        fields: fields,
        editView: false,
      });
    }
  };

  fieldsForPath = (path) => {
    const { data } = this.context;
    console.log("fields for path", data);
    const inputs = path ? data.inputsAccessibleAt(path) : data.allInputs;

    const fieldInputs = inputs.map((input) => {
      const label = [
        data.sections[input.page.section]?.title,
        input.title ?? input.name,
      ]
        .filter((p) => p)
        .join(" ");

      const values =
        `${input.type}` == "YesNoField"
          ? yesNoValues
          : data.findList(input.list)?.items;

      return {
        label,
        name: input.propertyPath,
        type: input.type,
        values,
      };
    });
    const conditionsInputs = data.conditions.map((condition) => ({
      label: condition.displayName,
      name: condition.name,
      type: "Condition",
    }));

    return fieldInputs.concat(conditionsInputs).reduce((obj, item) => {
      obj[item.name] = item;
      return obj;
    }, {});
  };

  toggleEdit = () => {
    this.setState({
      editView: !this.state.editView,
    });
  };

  onClickCancel = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const { cancelCallback } = this.props;
    this.setState({
      conditions: this.state.conditions.clear(),
      editView: false,
    });
    if (cancelCallback) {
      cancelCallback(e);
    }
  };

  onClickSave = async (event: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    const { conditionsChange, condition } = this.props;
    const { data, save } = this.context;
    const { conditions } = this.state;

    const nameError = this.validateName();

    if (nameError) {
      return;
    }

    const copy = clone(data);

    if (condition) {
      const updatedData = data.updateCondition(
        condition.name,
        conditions.name,
        conditions
      );
      await save(updatedData);
      if (conditionsChange) {
        conditionsChange(event);
      }
    } else {
      const conditionResult = await helpers.storeConditionIfNecessary(
        copy,
        conditions
      );
      await save(conditionResult.data);
      if (conditionsChange) {
        conditionsChange(event);
      }
    }
  };

  saveCondition = (condition) => {
    this.setState({
      conditions: this.state.conditions.add(condition),
    });
  };

  editCallback = (conditions) => {
    this.setState({
      conditions: conditions,
    });
  };

  onChangeDisplayName = (e: ChangeEvent<HTMLInputElement>) => {
    const copy = clone(this.state.conditions);
    copy.name = e.target.value;
    this.setState({
      conditions: copy,
    });
  };

  validateName = () => {
    const nameError: ErrorListItem = {
      href: "#cond-name",
      children: i18n("conditions.enterName"),
    };
    const { validationErrors } = this.state;
    const otherErrors = validationErrors.filter(
      (error) => error.href !== nameError.href
    );

    if (!this.state.conditions.name) {
      this.setState({
        validationErrors: [...otherErrors, nameError],
      });

      return true;
    }

    this.setState({ validationErrors: otherErrors });
    return false;
  };

  render() {
    const {
      conditions,
      editView,
      conditionString,
      validationErrors,
    } = this.state;
    const hasConditions = conditions.hasConditions;
    const nameError = validationErrors.filter(
      (error) => error.href === "#cond-name"
    )[0];
    const hasErrors = !!validationErrors.length;

    return (
      this.state.fields &&
      Object.keys(this.state.fields).length > 0 && (
        <div id="inline-conditions" data-testid={"inline-conditions"}>
          <div id="inline-condition-header">
            <div className="govuk-hint">{i18n("conditions.addOrEditHint")}</div>
            {conditionString && (
              <div
                id="condition-string-edit-warning"
                className="govuk-warning-text"
              >
                <span className="govuk-warning-text__icon" aria-hidden="true">
                  !
                </span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive">
                    {i18n("warning")}
                  </span>
                  {i18n("conditions.youCannotEditWarning", {
                    conditionString,
                  })}
                </strong>
              </div>
            )}
            <div>
              {hasErrors && <ErrorSummary errorList={validationErrors} />}
              <div
                className={classNames("govuk-form-group", {
                  "govuk-form-group--error": nameError,
                })}
              >
                <label
                  className="govuk-label govuk-label--s"
                  htmlFor="cond-name"
                >
                  {i18n("conditions.displayName")}
                </label>
                <div className="govuk-hint">
                  {i18n("conditions.displayNameHint")}
                </div>
                {nameError && (
                  <ErrorMessage>{nameError?.children}</ErrorMessage>
                )}
                <input
                  className={classNames("govuk-input govuk-input--width-20", {
                    "govuk-input--error": nameError,
                  })}
                  id="cond-name"
                  name="cond-name"
                  type="text"
                  value={conditions.name}
                  required
                  onChange={this.onChangeDisplayName}
                />
              </div>
              <div>
                <label
                  className="govuk-label govuk-label--s"
                  id="condition-string-label"
                  htmlFor="condition-string"
                >
                  {i18n("conditions.when")}
                </label>
              </div>
              <div className="govuk-hint">{i18n("conditions.whenHint")}</div>
            </div>
            {hasConditions && (
              <div id="conditions-display" className="govuk-body">
                <div key="condition-string" id="condition-string">
                  {conditions.toPresentationString()}
                </div>
                {!editView && (
                  <div>
                    <a
                      href="#"
                      id="edit-conditions-link"
                      className="govuk-link"
                      onClick={(e) => {
                        e.preventDefault();
                        this.toggleEdit();
                      }}
                    >
                      {i18n("conditions.notWhatYouMean")}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          {!editView && (
            <div>
              <InlineConditionsDefinition
                expectsCoordinator={hasConditions}
                fields={this.state.fields}
                saveCallback={this.saveCondition}
              />
              <div className="govuk-form-group">
                {hasConditions && (
                  <a
                    href="#"
                    id="save-inline-conditions"
                    className="govuk-button"
                    onClick={this.onClickSave}
                  >
                    {i18n("save")}
                  </a>
                )}
                <a
                  href="#"
                  id="cancel-inline-conditions-link"
                  className="govuk-link"
                  onClick={this.onClickCancel}
                >
                  {i18n("cancel")}
                </a>
              </div>
            </div>
          )}
          {editView && (
            <InlineConditionsEdit
              conditions={conditions}
              fields={this.state.fields}
              saveCallback={this.editCallback}
              exitCallback={this.toggleEdit}
            />
          )}
        </div>
      )
    );
  }
}
InlineConditions.contextType = DataContext;
export default InlineConditions;
