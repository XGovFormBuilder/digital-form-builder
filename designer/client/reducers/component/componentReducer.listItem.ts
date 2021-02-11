import { StaticListItem } from "./types";

/**
 * @deprecated This feature will be removed. Lists will be handled by Global Lists only.
 */
export function componentListItemReducer(
  state,
  action: {
    type: StaticListItem;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedItem } = state;
  switch (type) {
    case StaticListItem.STATIC_LIST_ITEM_EDIT_LABEL:
      return {
        ...state,
        selectedItem: { ...selectedItem, label: payload },
      };
    case StaticListItem.STATIC_LIST_ITEM_EDIT_VALUE:
      return {
        ...state,
        selectedItem: { ...selectedItem, value: payload },
      };
    case StaticListItem.STATIC_LIST_ITEM_EDIT_HINT:
      return {
        ...state,
        selectedItem: { ...selectedItem, hint: payload },
      };
    case StaticListItem.STATIC_LIST_ITEM_EDIT_CONDITION:
      return {
        ...state,
        selectedItem: { ...selectedItem, condition: payload },
      };
    case StaticListItem.STATIC_LIST_ITEM_DELETE: {
      delete state.showDeleteWarning, state.selectedItem;
      return state;
    }

    default:
      console.warn("Unrecognised action type", type);
      return state;
  }
}
