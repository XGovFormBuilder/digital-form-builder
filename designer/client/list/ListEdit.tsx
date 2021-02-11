import ListItems from "./ListItems";
import { Input } from "@govuk-jsx/input";
import React, { useContext } from "react";
import { ListActions } from "../reducers/listActions";
import { Actions } from "../reducers/component/types";
import { i18n } from "../i18n";
import {
  ListsEditorContext,
  ListsEditorStateActions,
  useSetListEditorContext,
} from "../reducers/list/listsEditorReducer";
import { DataContext } from "../context";
import { clone } from "@xgovformbuilder/model";
import { hasValidationErrors, validateTitle } from "../validations";
import ErrorSummary from "../error-summary";

const useListItem = (state, dispatch) => {
  const { state: listEditorState, dispatch: listsEditorDispatch } = useContext(
    ListsEditorContext
  );

  const { isEditingStatic } = listEditorState;

  function deleteItem(e) {
    e.preventDefault();
    dispatch({
      type: isEditingStatic ? Actions.DELETE : ListActions.DELETE_LIST_ITEM,
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
  const { state: listEditorState, dispatch: listsEditorDispatch } = useContext(
    ListsEditorContext
  );
  const { state, dispatch } = useSetListEditorContext();
  const { showWarning, isEditingStatic } = listEditorState;
  const { data, save } = useContext(DataContext);
  const handleDelete = (isNewList) => {
    if (isNewList) {
      listsEditorDispatch([ListsEditorStateActions.IS_EDITING_LIST, false]);
    }
    if (!showWarning) {
      listsEditorDispatch([ListsEditorStateActions.SHOW_WARNING, true]);
      return;
    }
  };

  const validate = () => {
    const { selectedList } = state;
    const errors = validateTitle("list-title", selectedList.title, i18n);
    if (selectedList.items.length <= 0) {
      errors.listItems = {
        children: ["list.errors.empty"],
      };
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const { selectedList, initialName } = state;
    const errors = validate();
    if (hasValidationErrors(errors)) {
      dispatch({
        type: ListActions.LIST_VALIDATION_ERRORS,
        payload: errors,
      });
      return;
    }
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
    dispatch({
      type: ListActions.SUBMIT,
    });
  };

  return {
    handleDelete,
    handleSubmit,
    isEditingStatic,
  };
}

export function ListEdit() {
  const { handleSubmit, handleDelete, isEditingStatic } = useListEdit();

  const { state, dispatch } = useSetListEditorContext();
  const { selectedList, createItem } = useListItem(state, dispatch);
  const { errors } = state;
  const validationErrors = hasValidationErrors(errors);
  return (
    <>
      {validationErrors && <ErrorSummary errorList={Object.values(errors)} />}
      <form onSubmit={handleSubmit} autoComplete="off">
        {!isEditingStatic && selectedList && (
          <Input
            id="list-title"
            hint={{ children: i18n("list.titleHint") }}
            label={{
              className: "govuk-label--s",
              children: [i18n("list.title")],
            }}
            value={selectedList.title}
            onChange={(e) =>
              dispatch({
                type: ListActions.EDIT_TITLE,
                payload: e.target.value,
              })
            }
            errorMessage={
              errors?.title ? { children: errors?.title.children } : undefined
            }
          />
        )}

        <ListItems />
        <a
          className="govuk-link govuk-body govuk-!-display-block govuk-!-margin-bottom-1"
          href="#createItem"
          data-testid="add-list-item"
          onClick={(e) => {
            e.preventDefault();
            createItem();
          }}
        >
          {i18n("list.item.add")}
        </a>
        {!isEditingStatic && (
          <>
            <button
              className="govuk-button"
              type="submit"
              onClick={handleSubmit}
            >
              {i18n("save")}
            </button>
            <a
              href="#"
              className="govuk-link govuk-body govuk-link--v-centre govuk-!-margin-left-2"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(selectedList.isNew);
              }}
            >
              {i18n(selectedList.isNew ? "cancel" : "delete")}
            </a>
          </>
        )}
      </form>
    </>
  );
}

export default ListEdit;
