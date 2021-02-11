import { ListActions } from "../../reducers/listActions";
import { DataContext } from "../../context";
import React, { useContext, useEffect, useState } from "react";
import { ComponentContext } from "../../reducers/component/componentReducer";
import { Actions } from "../../reducers/component/types";
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
  const { selectedListName, selectedComponent, isNew } = state;

  const { state: listState, dispatch: listDispatch } = useContext(ListContext);
  const { selectedList } = listState;

  const [selectedListTitle, setSelectedListTitle] = useState(
    selectedList?.title
  );
  const values = selectedComponent?.values;
  const isStatic = selectedListName === "static" || values?.type === "static";

  useEffect(() => {
    if (!isStatic) {
      const list = data.findList(selectedListName);
      listDispatch({
        type: ListActions.SET_SELECTED_LIST,
        payload: list,
      });
    }
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_STATIC, isStatic]);
  }, [selectedListName]);

  useEffect(() => {
    const list = data.findList(selectedListName);
    setSelectedListTitle(list?.title ?? list?.name ?? selectedComponent.title);
  }, [data, selectedListName]);

  const editList = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({
      type: ListActions.SET_SELECTED_LIST,
      payload: e.target.value,
    });
  };

  const createStaticList = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch({
      type: Actions.ADD_STATIC_LIST,
      payload: true,
    });
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_STATIC, true]);
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST, true]);
  };

  const handleEditListClick = (e: React.MouseEvent) => {
    e.preventDefault();
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST, true]);
  };

  const hasItems = values?.items?.length > 0 ?? false;

  return (
    <div className="govuk-form-group">
      <Label htmlFor="field-options-list" className="govuk-label--s">
        {i18n("list.select")}
      </Label>
      <div className="govuk-hint">
        {i18n("list.static.hint")} {i18n("list.static.saveFirst")}
      </div>
      <select
        className="govuk-select govuk-input--width-10"
        id="field-options-list"
        name="options.list"
        value={selectedListName}
        onChange={editList}
      >
        {!hasItems && <option value="static" />}
        {hasItems && <option value="static">{selectedComponent.title}</option>}
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

      {!isNew &&
        !!selectedListName &&
        (hasItems || selectedListName !== "static") && (
          <a
            href="#"
            className="govuk-link govuk-!-display-block"
            onClick={handleEditListClick}
          >
            {i18n("list.edit", { title: selectedListTitle })}
          </a>
        )}

      {!isNew && !hasItems && (
        <a
          href="#"
          className="govuk-link govuk-!-display-block"
          onClick={createStaticList}
        >
          {i18n("list.static.newTitle")}
        </a>
      )}
    </div>
  );
}

export default ComponentListSelect;
