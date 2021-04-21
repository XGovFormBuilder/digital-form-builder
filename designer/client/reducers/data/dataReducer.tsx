import react, { useReducer } from "react";
import { DataAction, DataActionType } from "./types";
import { addComponent, updateComponent } from "./component";

function reducer(state, action: DataAction) {
  const { data } = state;
  const clone = { ...data };
  switch (action.type) {
    case DataActionType.UPDATE_COMPONENT:
      const { path, component } = action.payload;
      return updateComponent(data, path, component);

    case DataActionType.ADD_COMPONENT:
      const { path, component } = action.payload;
      return addComponent(data, path, component);

    case DataActionType.ADD_LIST:
      const { list } = action;
      return { ...data, lists: [...data.lists, list] };

    case DataActionType.ADD_CONDITION:
      const { condition } = action;
      return { ...data, conditions: [...data.condtions, condition] };

    case DataActionType.UPDATE_CONDITION:
      break;
    case DataActionType.REMOVE_CONDITION:
      break;
    case DataActionType.ADD_LINK:
      break;
    case DataActionType.UPDATE_LINK:
      break;
    case DataActionType.ADD_PAGE:
      const { page } = action;
      return {
        ...data,
        pages: [...data.pages, page],
      };

    case DataActionType.UPDATE_PAGE:
      break;
  }
}
