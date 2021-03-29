import React, { useContext } from "react";
import { i18n } from "../i18n";
import {
  ListsEditorContext,
  ListsEditorStateActions,
} from "../reducers/list/listsEditorReducer";
import { DataContext } from "../context";
import { clone } from "@xgovformbuilder/model";

export function useWarning() {
  const { state, dispatch } = useContext(ListsEditorContext);
  const { data, save } = useContext(DataContext);

  async function confirm(e) {
    e.preventDefault();
    const { initialName } = state;
    const copy = clone(data).toJSON();
    const selectedListIndex = copy.lists.findIndex(
      (list) => list.name === initialName
    );
    if (!!selectedListIndex) {
      copy.lists.splice(selectedListIndex, 1);
      await save(copy);
    }
    dispatch([ListsEditorStateActions.IS_EDITING_LIST, false]);
  }
  function keep(e) {
    e.preventDefault();
    dispatch([ListsEditorStateActions.SHOW_WARNING, false]);
  }

  return { confirm, keep };
}

export function Warning() {
  const { confirm, keep } = useWarning();

  return (
    <div className="warning govuk-body">
      <h2 className="warning__title">{i18n("list.deleteWarning.title")}</h2>
      <p className="warning__message">{i18n("list.deleteWarning.message")}</p>
      <div className="warning__actions">
        <a href="#" onClick={confirm} className={"warning__action"}>
          {i18n("list.deleteWarning.confirm")}
        </a>
        <a href="#" onClick={keep} className={"warning__action"}>
          {i18n("list.deleteWarning.keep")}
        </a>
      </div>
    </div>
  );
}
