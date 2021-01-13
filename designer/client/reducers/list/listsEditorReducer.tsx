import { ListContext } from "../listReducer";
import { ComponentContext } from "../component/componentReducer";
import React, { createContext, useContext, useReducer } from "react";

export enum ListsEditorStateActions {
  IS_EDITING_LIST = "IS_EDITING_LIST",
  IS_EDITING_LIST_ITEM = "IS_EDITING_LIST_ITEM",
  IS_EDITING_STATIC = "IS_EDITING_STATIC",
  SET_LIST_TITLE = "SET_LIST_TITLE",
  SET_LIST_ITEM_TITLE = "SET_LIST_ITEM_TITLE",
  SET_CONTEXT = "SET_CONTEXT",
  SHOW_WARNING = "SHOW_WARNING",
  RESET = "RESET",
}

export interface ListsEditorState {
  isEditingList: boolean;
  isEditingListItem: boolean;
  isEditingStatic: boolean;
  listTitle?: string;
  listItemTitle?: string;
  showWarning?: boolean;
  initialName?: string;
  listEditContext: typeof ListContext | typeof ComponentContext;
}

export function initListsEditingState(
  isEditingFromComponent = false
): ListsEditorState {
  return {
    isEditingList: false,
    isEditingListItem: false,
    isEditingStatic: false,
    listEditContext: isEditingFromComponent ? ComponentContext : ListContext,
  };
}

export const ListsEditorContext = createContext<{
  state: ListsEditorState;
  dispatch: React.Dispatch<any>;
}>({
  state: initListsEditingState(),
  dispatch: () => {},
});
ListsEditorContext.displayName = "ListsEditorContext";

/**
 * @desc Responsible for which screens should be open, and whether ComponentContext or ListContext should be used for changes.
 */
export function listsEditorReducer(
  state,
  action: [ListsEditorStateActions, boolean | string]
): ListsEditorState {
  const [type, payload] = action;

  switch (type) {
    case ListsEditorStateActions.SET_CONTEXT:
      return { ...state, listEditContext: payload };
    case ListsEditorStateActions.SET_LIST_TITLE:
      return { ...state, listTitle: payload };
    case ListsEditorStateActions.SET_LIST_ITEM_TITLE:
      return { ...state, listItemTitle: payload };
    case ListsEditorStateActions.IS_EDITING_LIST:
      return { ...state, isEditingList: payload, showWarning: false };
    case ListsEditorStateActions.IS_EDITING_LIST_ITEM:
      return { ...state, isEditingListItem: payload };
    case ListsEditorStateActions.IS_EDITING_STATIC:
      return {
        ...state,
        isEditingStatic: payload,
        listEditContext: payload ? ComponentContext : ListContext,
      };
    case ListsEditorStateActions.SHOW_WARNING:
      return {
        ...state,
        showWarning: payload,
      };
    case ListsEditorStateActions.RESET:
      return initListsEditingState();
  }
}

export const ListsEditorContextProvider = (props) => {
  const [state, dispatch] = useReducer(
    listsEditorReducer,
    initListsEditingState()
  );

  return (
    <ListsEditorContext.Provider value={{ state, dispatch }}>
      {props.children}
    </ListsEditorContext.Provider>
  );
};

export const useSetListEditorContext = () => {
  const { state } = useContext(ListsEditorContext);
  return useContext(state.listEditContext);
};
