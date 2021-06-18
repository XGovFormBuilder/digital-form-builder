import randomId from "../randomId";
import React, { createContext, useContext, useReducer } from "react";
import { DataContext } from "../context";
import { ListActions } from "./listActions";
import { arrayMove } from "../helpers";

export interface ListState {
  selectedList?: any; // TODO:- type
  selectedItem?: any; // TODO:- type
  selectedItemIndex?: number;
  isEditingFromComponent?: boolean;
  selectedListItem?: any; //TODO:- type
  initialName?: string;
  initialTitle?: string;
  errors?: any;
  listItemErrors?: any;
}

export const ListContext = createContext<{
  state: ListState;
  dispatch: React.Dispatch<any>;
}>({
  state: {},
  dispatch: () => {},
});

/**
 * Allows mutation of the {@link List} from any component that is nested within {@link ListContextProvider}
 */
export function listReducer(
  state: ListState = {},
  action: { type: ListActions; payload: any }
): ListState {
  const { type, payload } = action;
  const { selectedList, selectedItem, selectedItemIndex } = state;
  switch (type) {
    case ListActions.DELETE_LIST_ITEM: {
      delete state.selectedListItem;
      return {
        ...state,
        selectedList: {
          ...selectedList,
          items: selectedList.items.filter(
            (_item, index) =>
              index !== (!!payload ? payload : selectedItemIndex)
          ),
        },
      };
    }
    case ListActions.EDIT_LIST:
      return { ...state, errors: {} };

    case ListActions.DESELECT_LIST_ITEM:
      delete state.selectedItem, state.selectedItemIndex;

      return { ...state };

    case ListActions.ADD_NEW_LIST: {
      const listId = randomId();
      return {
        selectedList: {
          title: "",
          name: listId,
          type: "string",
          items: [],
          isNew: true,
        },
        initialName: listId,
      };
    }

    case ListActions.SET_SELECTED_LIST:
      return {
        ...state,
        selectedList: payload,
        initialName: payload?.name || state.initialName,
        initialTitle: payload?.title,
      };

    case ListActions.EDIT_TITLE:
      return { ...state, selectedList: { ...selectedList, title: payload } };

    case ListActions.EDIT_LIST_VALUE_TYPE:
      return { ...state, selectedList: { ...selectedList, type: payload } };

    case ListActions.ADD_LIST_ITEM:
      return { ...state, selectedItem: { isNew: true }, listItemErrors: {} };

    case ListActions.EDIT_LIST_ITEM: {
      let selectedItem, selectedItemIndex;
      if (typeof payload === "number") {
        selectedItem = selectedList.items[payload];
      } else {
        selectedItem = payload;
        selectedItemIndex = selectedList.items.findIndex(
          (item) => item === payload
        );
      }
      return {
        ...state,
        selectedItem,
        selectedItemIndex,
        listItemErrors: {},
      };
    }

    case ListActions.EDIT_LIST_ITEM_TEXT:
      return {
        ...state,
        selectedItem: { ...selectedItem, text: payload },
      };

    case ListActions.EDIT_LIST_ITEM_DESCRIPTION: {
      return {
        ...state,
        selectedItem: { ...selectedItem, description: payload },
      };
    }

    case ListActions.EDIT_LIST_ITEM_VALUE: {
      return { ...state, selectedItem: { ...selectedItem, value: payload } };
    }

    case ListActions.EDIT_LIST_ITEM_CONDITION: {
      return {
        ...state,
        selectedItem: { ...selectedItem, condition: payload },
      };
    }

    case ListActions.SORT_LIST_ITEM: {
      const changedItems = arrayMove(
        selectedList.items,
        payload.oldIndex,
        payload.newIndex
      );
      return {
        ...state,
        selectedList: {
          ...selectedList,
          items: changedItems,
        },
      };
    }

    case ListActions.SUBMIT_LIST_ITEM: {
      return { selectedList };
    }

    case ListActions.LIST_ITEM_VALIDATION_ERRORS: {
      return {
        ...state,
        listItemErrors: payload,
      };
    }

    case ListActions.LIST_VALIDATION_ERRORS: {
      return {
        ...state,
        errors: payload,
      };
    }

    case ListActions.SUBMIT:
      return {
        ...state,
        errors: {},
      };
  }
}

/**
 * Allows components to retrieve {@link ListState} and {@link dispatch} from any component nested within `<ListContextProvider>`
 */
export const ListContextProvider = (props) => {
  let init: ListState = {};
  const { selectedListName } = props;
  const { data } = useContext(DataContext);

  if (selectedListName) {
    init = {
      selectedList: data.lists.find(
        (list) => list.name === props.selectedListName
      ),
      initialName: selectedListName,
      initialTitle: data.lists.find(selectedListName)?.title,
      isEditingFromComponent: true,
    };
  }

  const [state, dispatch] = useReducer(listReducer, { ...init });

  return (
    <ListContext.Provider value={{ state, dispatch }}>
      {props.children}
    </ListContext.Provider>
  );
};
