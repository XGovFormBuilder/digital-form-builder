import React, { memo, useContext } from "react";
import { withI18n } from "./../i18n";
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
import {
  ListItemHook,
  useDeleteStaticListItem,
  useGlobalListItem,
  useListItemAdapter,
  useStaticListItem,
} from "../hooks/list/useListItem";

type Props = {
  i18n: (string: string, interpolation?: any) => any;
};

export function ListItemEdit(props: Props) {
  const [{ isEditingStatic }, listsEditorDispatch] = useContext(
    ListsEditorContext
  );
  const [state, dispatch] = useSetListEditorContext();
  const { data, save } = useContext(DataContext);

  const {
    handleTitleChange,
    handleConditionChange,
    handleValueChange,
    handleHintChange,
    prepareForSubmit,
    prepareForDelete,
    value,
    condition,
    title,
    hint,
  } = useListItemAdapter(state, dispatch);

  const { i18n } = props;
  const { conditions } = data;
  let error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const copy = clone(data);
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
    <div>
      <form onSubmit={handleSubmit}>
        <Input
          label={{
            className: "govuk-label--s",
            children: [i18n("list.item.title")],
          }}
          value={title}
          onChange={handleTitleChange}
        />
        <Textarea
          label={{ children: [i18n("list.item.titleHint")] }}
          value={hint}
          onChange={handleHintChange}
        />
        <Input
          label={{ children: [i18n("list.item.value")] }}
          hint={{ children: [i18n("list.item.valueHint")] }}
          value={value}
          errorMessage={error}
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
    </div>
  );
}

export default memo(withI18n(ListItemEdit));
