import react, { useReducer } from "react";
import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { Page } from "@xgovformbuilder/model";
import { DataAction, DataActionType } from "./types";

type Path = Page["path"];
type ConditionName = ConditionsWrapper["name"];

function reducer(state: any, action: DataAction) {
  const data = { ...state };
  const { payload } = action;
  switch (action.type) {
    case DataActionType.UPDATE_COMPONENT:
      break;
    case DataActionType.ADD_COMPONENT:
      break;
    case DataActionType.ADD_LIST:
      break;
    case DataActionType.ADD_CONDITION:
      break;
    case DataActionType.UPDATE_CONDITION:
      break;
    case DataActionType.REMOVE_CONDITION:
      break;
    case DataActionType.ADD_LINK:
      break;
    case DataActionType.UPDATE_LINK:
      break;
    case DataActionType.ADD_PAGE:
      break;
    case DataActionType.UPDATE_PAGE:
      break;
  }
}
