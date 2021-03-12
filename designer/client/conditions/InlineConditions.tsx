import React, {
  MouseEvent,
  ChangeEvent,
  useState,
  useContext,
  useEffect,
} from "react";
import classNames from "classnames";
import { ConditionsModel, clone } from "@xgovformbuilder/model";

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

function InlineConditions({
  path,
  condition,
  cancelCallback,
  conditionsChange,
}: Props) {
  const [editView, setEditView] = useState(false);
  const [conditions, setConditions] = useState(
    typeof condition.value === "object"
      ? ConditionsModel.from(condition.value)
      : new ConditionsModel()
  );
  const [fields, setFields] = useState<any>();
  const [conditionString, setConditionString] = useState("");
  const [validationErrors, setValidationErrors] = useState<ErrorListItem[]>([]);
  const [hasErrors, setHasErrors] = useState(false);
  const { data, save } = useContext(DataContext);
  const { hasConditions = false } = conditions;
  const [nameError, setNameError] = useState<ErrorListItem>();

  useEffect(() => {
    function getFields() {
      console.log("fields for path", data);
      const inputs = path ? data.inputsAccessibleAt(path) : data.allInputs;

      const fieldInputs = inputs.map((input) => ({
        label: input.displayName,
        name: input.propertyPath,
        type: input.type,
        values: data.findList(input.list).items.value,
      }));
      const conditionsInputs = data.conditions.map((condition) => ({
        label: condition.displayName,
        name: condition.name,
        type: "Condition",
      }));

      return fieldInputs.concat(conditionsInputs).reduce((obj, item) => {
        obj[item.name] = item;
        return obj;
      }, {});
    }
    setFields(getFields());
  }, []);

  function onClickCancel(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    setConditions(conditions?.clear());
    setEditView(false);
    cancelCallback?.(e);
  }

  function toggleEdit() {
    setEditView((prevState) => !prevState);
  }

  async function onClickSave(event?: MouseEvent<HTMLAnchorElement>) {
    event?.preventDefault();

    const nameError = validateName();

    if (nameError) {
      return;
    }

    const copy = clone(data);

    if (condition) {
      const updatedData = data.updateCondition(
        condition.name,
        conditions?.name ?? "",
        conditions
      );
      await save(updatedData);
      conditionsChange?.(event);
    } else {
      const conditionResult = await helpers.storeConditionIfNecessary(
        copy,
        conditions
      );
      await save(conditionResult.data);
      conditionsChange?.(event);
    }
  }

  function validateName() {
    const nameError: ErrorListItem = {
      href: "#cond-name",
      children: i18n("conditions.enterName"),
    };
    const otherErrors = validationErrors.filter(
      (error) => error.href !== nameError.href
    );

    if (!conditions?.name) {
      setValidationErrors([...otherErrors, nameError]);
      return true;
    }
    setValidationErrors(otherErrors);
    return false;
  }

  function saveCondition(condition) {
    setConditions((prevState) => prevState?.add(condition));
  }

  function editCallback(conditions) {
    setConditions(conditions);
  }

  function onChangeDisplayName(e: ChangeEvent<HTMLInputElement>) {
    const copy = clone(conditions);
    copy.name = e.target.value;
    setConditions(copy);
  }

  useEffect(() => {
    setHasErrors(validationErrors.length > 0);
  }, [validationErrors]);

  useEffect(() => {
    if (typeof condition.value !== "string") {
      return;
    }
    setConditionString(condition.value);
  }, [condition.value]);

  useEffect(() => {
    setNameError(
      validationErrors?.filter((error) => error.href === "#cond-name")?.[0]
    );
  }, [validationErrors]);

  return fields && Object.keys(fields).length > 0 ? (
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
            <label className="govuk-label govuk-label--s" htmlFor="cond-name">
              {i18n("conditions.displayName")}
            </label>
            <div className="govuk-hint">
              {i18n("conditions.displayNameHint")}
            </div>
            {nameError && <ErrorMessage>{nameError?.children}</ErrorMessage>}
            <input
              className={classNames("govuk-input govuk-input--width-20", {
                "govuk-input--error": nameError,
              })}
              id="cond-name"
              name="cond-name"
              type="text"
              value={conditions.name}
              required
              onChange={onChangeDisplayName}
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
                    toggleEdit();
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
            fields={fields}
            saveCallback={saveCondition}
          />
          <div className="govuk-form-group">
            {hasConditions && (
              <a
                href="#"
                id="save-inline-conditions"
                className="govuk-button"
                onClick={onClickSave}
              >
                {i18n("save")}
              </a>
            )}
            <a
              href="#"
              id="cancel-inline-conditions-link"
              className="govuk-link"
              onClick={onClickCancel}
            >
              {i18n("cancel")}
            </a>
          </div>
        </div>
      )}
      {editView && (
        <InlineConditionsEdit
          conditions={conditions}
          fields={fields}
          saveCallback={editCallback}
          exitCallback={toggleEdit}
        />
      )}
    </div>
  ) : null;
}

export default InlineConditions;
