import React, { createContext, useReducer } from "react";

export enum ListsEditorStateActions {
  IS_EDITING_LIST = "IS_EDITING_LIST",
  IS_EDITING_LIST_ITEM = "IS_EDITING_LIST_ITEM",
  SET_LIST_TITLE = "SET_LIST_TITLE",
  SET_LIST_ITEM_TITLE = "SET_LIST_ITEM_TITLE",
  SET_CONTEXT = "SET_CONTEXT",
  SHOW_WARNING = "SHOW_WARNING",
  RESET = "RESET",
}

export interface ListsEditorState {
  isEditingList: boolean;
  isEditingListItem: boolean;
  listTitle?: string;
  listItemTitle?: string;
  showWarning?: boolean;
  initialName?: string;
}

export function initListsEditingState(): ListsEditorState {
  return {
    isEditingList: false,
    isEditingListItem: false,
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
 * Responsible for which list editing screens should be open in {@link ListsEdit} component.
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
