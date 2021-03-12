import React, { MouseEvent, ChangeEvent, useState, useContext } from "react";
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

interface State {
  editView?: boolean;
  conditions: ConditionsModel;
  fields: any;
  conditionString: any;
  validationErrors: ErrorListItem[];
}

function InlineConditions({
  path,
  condition,
  cancelCallback,
  conditionsChange,
}: Props) {
  const [editView, setEditView] = useState(false);
  const [conditions, setConditions] = useState<ConditionsModel>();
  const [fields, setFields] = useState<any>();
  const [conditionString, setConditionString] = useState("");
  const [validationErrors, setValidationErrors] = useState<ErrorListItem[]>([]);
  const { data, save } = useContext(DataContext);

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
}

InlineConditions.contextType = DataContext;
export default InlineConditions;
