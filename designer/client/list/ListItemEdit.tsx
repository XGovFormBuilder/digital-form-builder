import React, { memo, useContext } from "react";
import { i18n } from "./../i18n";
import { Input } from "@govuk-jsx/input";
import { Textarea } from "@govuk-jsx/textarea";
import { Label } from "@govuk-jsx/label";
import { Hint } from "@govuk-jsx/hint";
import { DataContext } from "../context";
import {
  ListsEditorContext,
  ListsEditorStateActions,
} from "../reducers/list/listsEditorReducer";
import { useListItem } from "../hooks/list/useListItem";
import { ListContext } from "../reducers/listReducer";

export function ListItemEdit() {
  const { dispatch: listsEditorDispatch } = useContext(ListsEditorContext);
  const { state, dispatch } = useContext(ListContext);
  const { data, save } = useContext(DataContext);

  const {
    handleTitleChange,
    handleConditionChange,
    handleValueChange,
    handleHintChange,
    prepareForSubmit,
    validate,
    value,
    condition,
    title,
    hint,
  } = useListItem(state, dispatch);

  const { conditions } = data;
  const { listItemErrors: errors } = state;
  const handleSubmit = async (e) => {
    e.preventDefault();
    const copy = { ...data };
    const hasErrors = validate(i18n);
    if (hasErrors) return;
    await save(prepareForSubmit(copy));
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST_ITEM, false]);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input
          id="title"
          data-testid="list-item-text"
          name="list-item-text"
          label={{
            className: "govuk-label--s",
            children: [i18n("list.item.title")],
          }}
          hint={{ children: i18n("list.item.titleHint") }}
          value={title}
          onChange={handleTitleChange}
          errorMessage={
            errors?.title ? { children: errors?.title.children } : undefined
          }
        />
        <Textarea
          label={{ children: i18n("list.item.help") }}
          hint={{ children: i18n("list.item.helpHint") }}
          value={hint}
          data-testid="list-item-hint"
          name="list-item-hint"
          id="hint"
          onChange={handleHintChange}
        />
        <Input
          label={{ children: [i18n("list.item.value")] }}
          hint={{ children: [i18n("list.item.valueHint")] }}
          id="value"
          data-testid="list-item-value"
          name="list-item-value"
          value={value}
          errorMessage={
            errors?.value ? { children: errors?.value.children } : undefined
          }
          onChange={handleValueChange}
        />
        <Label for="options.condition">{i18n("list.item.conditions")}</Label>
        <Hint>{i18n("list.item.conditionsHint")}</Hint>
        <select
          className="govuk-select"
          id="condition"
          name="options.condition"
          data-testid="list-condition-select"
          value={condition}
          onChange={handleConditionChange}
        >
          <option value="" data-testid="list-condition-option" />
          {conditions?.map((condition) => (
            <option
              key={condition.name}
              value={condition.name}
              data-testid="list-condition-option"
            >
              {condition.displayName}
            </option>
          ))}
        </select>
        <hr />
        <div className={"govuk-form-group"}>
          <button
            data-testid="save-list-item"
            className="govuk-button"
            type="submit"
            onClick={handleSubmit}
          >
            {i18n("save")}
          </button>
        </div>
      </form>
    </>
  );
}

export default memo(ListItemEdit);
