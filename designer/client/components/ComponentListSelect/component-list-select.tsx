import { ListActions } from "../../reducers/listActions";
import { DataContext } from "../../context";
import React, { useContext, useEffect, useState } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Label } from "@govuk-jsx/label";
import { i18n } from "../../i18n";
import { ListContext } from "../../reducers/listReducer";
import {
  ListsEditorContext,
  ListsEditorStateActions,
} from "../../reducers/list/listsEditorReducer";

export function ComponentListSelect() {
  const { data } = useContext(DataContext);
  const { dispatch: listsEditorDispatch } = useContext(ListsEditorContext);

  const { state, dispatch } = useContext(ComponentContext);
  const { selectedListName, selectedComponent } = state;

  const { state: listState, dispatch: listDispatch } = useContext(ListContext);
  const { selectedList } = listState;

  const [selectedListTitle, setSelectedListTitle] = useState(
    selectedList?.title
  );

  useEffect(() => {
    const list = data.findList(selectedListName);
    listDispatch({
      type: ListActions.SET_SELECTED_LIST,
      payload: list,
    });
  }, [data, listDispatch, selectedListName]);

  useEffect(() => {
    const list = data.findList(selectedListName);
    setSelectedListTitle(list?.title ?? list?.name ?? selectedComponent.title);
  }, [data, selectedComponent.title, selectedListName]);

  const editList = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: ListActions.SET_SELECTED_LIST,
      payload: e.target.value,
    });
  };

  const handleEditListClick = (e: React.MouseEvent) => {
    e.preventDefault();
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST, true]);
  };

  return (
    <div className="govuk-form-group">
      <Label htmlFor="field-options-list" className="govuk-label--s">
        {i18n("list.select.title")}
      </Label>
      <span className="govuk-hint">{i18n("list.select.helpText")}</span>
      <select
        className="govuk-select govuk-input--width-10"
        id="field-options-list"
        name="options.list"
        value={selectedListName}
        onChange={editList}
      >
        <option />
        {data.lists.map(
          (
            list: {
              name: string | number | readonly string[] | undefined;
              title: React.ReactNode;
            },
            index: number
          ) => {
            return (
              <option key={`${list.name}-${index}`} value={list.name}>
                {list.title}
              </option>
            );
          }
        )}
      </select>
      <a
        href="#"
        className="govuk-link govuk-!-display-block"
        onClick={handleEditListClick}
      >
        {i18n("list.edit", { title: selectedListTitle })}
      </a>
    </div>
  );
}

export default ComponentListSelect;
