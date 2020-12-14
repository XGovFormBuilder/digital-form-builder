import { StaticListItem } from "./types";

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
    case StaticListItem.EDIT_LABEL:
      return {
        ...state,
        selectedItem: { ...selectedItem, label: payload },
      };
    case StaticListItem.EDIT_VALUE:
      return {
        ...state,
        selectedItem: { ...selectedItem, value: payload },
      };
    case StaticListItem.EDIT_HINT:
      return {
        ...state,
        selectedItem: { ...selectedItem, hint: payload },
      };
    case StaticListItem.EDIT_CONDITION:
      return {
        ...state,
        selectedItem: { ...selectedItem, condition: payload },
      };
    case StaticListItem.DELETE: {
      delete state.showDeleteWarning, state.selectedItem;
      return state;
    }

    default:
      console.warn("Unrecognised action type", type);
      return state;
  }
}
