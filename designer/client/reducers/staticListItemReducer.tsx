export enum StaticListItemActions {
  EDIT_LABEL = "STATIC_LIST_ITEM_EDIT_LABEL",
  EDIT_VALUE = "STATIC_LIST_ITEM_EDIT_VALUE",
  EDIT_HINT = "STATIC_LIST_ITEM_EDIT_HINT",
  EDIT_CONDITION = "STATIC_LIST_ITEM_EDIT_CONDITION",
  SUBMIT = "STATIC_LIST_ITEM_SUBMIT",
  DELETE = "STATIC_LIST_ITEM_DELETE",
}

export function staticListItemReducer(
  state,
  action: {
    type: StaticListItemActions;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedItem } = state;
  switch (type) {
    case StaticListItemActions.EDIT_LABEL:
      return {
        ...state,
        selectedItem: { ...selectedItem, label: payload },
      };
    case StaticListItemActions.EDIT_VALUE:
      return {
        ...state,
        selectedItem: { ...selectedItem, value: payload },
      };
    case StaticListItemActions.EDIT_HINT:
      return {
        ...state,
        selectedItem: { ...selectedItem, hint: payload },
      };
    case StaticListItemActions.EDIT_CONDITION:
      return {
        ...state,
        selectedItem: { ...selectedItem, condition: payload },
      };

    case StaticListItemActions.DELETE: {
      delete state.showDeleteWarning, state.selectedItem;
      return state;
    }

    default:
      console.warn("Unrecognised action type", type);
      return state;
  }
}
