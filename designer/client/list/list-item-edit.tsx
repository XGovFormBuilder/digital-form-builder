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
  useSetListEditorContext,
} from "../reducers/list/listsEditorReducer";
import { clone } from "@xgovformbuilder/model";
import { useListItem } from "../hooks/list/useListItem";

export function ListItemEdit() {
  const { dispatch: listsEditorDispatch } = useContext(ListsEditorContext);
  const { state, dispatch } = useSetListEditorContext();
  const { data, save } = useContext(DataContext);

  const {
    handleTitleChange,
    handleConditionChange,
    handleValueChange,
    handleHintChange,
    prepareForSubmit,
    prepareForDelete,
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
    const copy = clone(data);
    const hasErrors = validate(i18n);
    if (hasErrors) return;
    await save(prepareForSubmit(copy));
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST_ITEM, false]);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    const copy = clone(data);
    await save(prepareForDelete(copy));
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST_ITEM, false]);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input
          id="title"
          label={{
            className: "govuk-label--s",
            children: [i18n("list.item.title")],
          }}
          value={title}
          onChange={handleTitleChange}
          errorMessage={
            errors?.title ? { children: errors?.title.children } : undefined
          }
        />
        <Textarea
          label={{ children: [i18n("list.item.titleHint")] }}
          value={hint}
          onChange={handleHintChange}
        />
        <Input
          label={{ children: [i18n("list.item.value")] }}
          hint={{ children: [i18n("list.item.valueHint")] }}
          id="value"
          value={value}
          errorMessage={
            errors?.value ? { children: errors?.value.children } : undefined
          }
          onChange={handleValueChange}
        />

        <Label>{i18n("list.item.conditions")}</Label>
        <Hint>{i18n("list.item.conditionsHint")}</Hint>
        <select
          className="govuk-select"
          id="condition"
          name="options.condition"
          value={condition}
          onChange={handleConditionChange}
        >
          <option value="" />
          {conditions?.map((condition) => (
            <option key={condition.name} value={condition}>
              {condition.name}
            </option>
          ))}
        </select>
        <hr />

        <div className={"govuk-form-group"}>
          <button className="govuk-button" type="submit" onClick={handleSubmit}>
            Save
          </button>
          <a
            href="#"
            onClick={handleDelete}
            className="govuk-link govuk-!-margin-left-2 govuk-link--v-centre"
          >
            Delete
          </a>
        </div>
      </form>
    </>
  );
}

export default memo(ListItemEdit);
