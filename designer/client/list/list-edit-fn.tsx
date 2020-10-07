import ListItems from "./list-items";
import { Hint } from "@govuk-jsx/hint";
import { Label } from "@govuk-jsx/label";
import { ErrorMessage } from "@govuk-jsx/error-message";
import React, { useContext } from "react";
import { ListActions } from "../reducers/listActions";
import { withI18n } from "../i18n";
import {
  ListsEditorContext,
  ListsEditorStateActions,
  useSetListEditorContext,
} from "../reducers/list/listsEditorReducer";
import { StaticListItemActions } from "../reducers/staticListItemReducer";
import { DataContext } from "../context";
import { clone } from "@xgovformbuilder/model";

const useListItem = (state, dispatch) => {
  const [{ isEditingStatic }, listsEditorDispatch]: any = useContext(
    ListsEditorContext
  );

  function deleteItem(e) {
    e.preventDefault();
    console.log(state);
    dispatch({
      type: isEditingStatic
        ? StaticListItemActions.DELETE
        : ListActions.DELETE_LIST_ITEM,
    });
  }

  function createItem() {
    dispatch({ type: ListActions.ADD_LIST_ITEM });
    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST_ITEM, true]);
  }

  return {
    deleteItem,
    createItem,
    selectedList: isEditingStatic
      ? state.selectedComponent.values
      : state.selectedList,
    isEditingStatic,
  };
};

function useListEdit() {
  const [state] = useSetListEditorContext();
  const [
    { showWarning, isEditingStatic },
    listsEditorDispatch,
  ]: any = useContext(ListsEditorContext);
  const { data, save } = useContext(DataContext);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!showWarning) {
      listsEditorDispatch([ListsEditorStateActions.SHOW_WARNING, true]);
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { selectedList, initialName } = state;

    const copy = clone(data);
    if (selectedList.isNew) {
      delete selectedList.isNew;
      copy.addList(selectedList);
    } else {
      const selectedListIndex = copy.lists.findIndex(
        (list) => list.name === initialName
      );
      copy.lists[selectedListIndex] = selectedList;
    }
    await save(copy.toJSON());

    listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST, false]);
  };

  return {
    handleDelete,
    handleSubmit,
    isEditingStatic,
  };
}

export function ListEdit(props) {
  const { i18n } = props;
  const { handleSubmit, handleDelete, isEditingStatic } = useListEdit();

  const [state, dispatch] = useSetListEditorContext();
  const { selectedList, createItem } = useListItem(state, dispatch);

  const titleHasError = false;

  return (
    <>
      <form onSubmit={handleSubmit} autoComplete="off">
        {!isEditingStatic && selectedList && (
          <div
            className={`govuk-form-group ${
              titleHasError ? "govuk-form-group--error" : ""
            }`}
          >
            <Label htmlFor="list-title">{i18n("list.title")}</Label>
            <Hint>{i18n("wontShow")}</Hint>
            {titleHasError && (
              <ErrorMessage>{i18n("errors.required")}</ErrorMessage>
            )}
            <input
              className={`govuk-input govuk-input--width-20 ${
                titleHasError ? "govuk-input--error" : ""
              }`}
              id="list-title"
              name="title"
              type="text"
              value={selectedList.title}
              onChange={(e) =>
                dispatch({
                  type: ListActions.EDIT_TITLE,
                  payload: e.target.value,
                })
              }
            />
          </div>
        )}

        <ListItems />
        <a
          className="govuk-link govuk-body govuk-!-display-block govuk-!-margin-bottom-1"
          href="#"
          onClick={createItem}
        >
          {i18n("list.createListItem")}
        </a>
        {!isEditingStatic && (
          <>
            <button
              className="govuk-button"
              type="submit"
              onClick={handleSubmit}
            >
              Save
            </button>
            <a
              href="#"
              className="govuk-link govuk-link--v-centre govuk-!-margin-left-2"
              onClick={handleDelete}
            >
              {i18n("delete")}
            </a>
          </>
        )}
      </form>
    </>
  );
}

export default withI18n(ListEdit);
