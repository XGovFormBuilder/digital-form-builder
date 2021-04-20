import react, { useReducer } from "react";
import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { Page } from "@xgovformbuilder/model";

type Path = Page["path"];
type ConditionName = ConditionsWrapper["name"];

function UseAddLink(from: Path, to: Path, condition?: ConditionName);
function UseUpdateLink(from: Path, to: Path, condition?: ConditionName);

enum DataActions {
  UPDATE_COMPONENT = "UPDATE_COMPONENT",
  ADD_COMPONENT = "ADD_COMPONENT",

  ADD_LIST = "ADD_LIST",

  ADD_CONDITION = "ADD_CONDITION",
  UPDATE_CONDITION = "UPDATE_CONDITION",
  REMOVE_CONDITION = "REMOVE_CONDITION",

  ADD_LINK = "ADD_LINK",
  UPDATE_LINK = "UPDATE_LINK",

  ADD_PAGE = "ADD_PAGE",
  UPDATE_PAGE = "UPDATE_PAGE",
}
type Action = {
  type: DataActions;
  payload: any;
};

type AddLinkAction = {
  type: DataActions.ADD_LINK;
  payload: {
    from: Path;
    to: Path;
    condition?: ConditionName;
  };
};

function reducer(state: any, action: Action) {
  const data = { ...state };
  switch (action.type) {
    case DataActions.UPDATE_COMPONENT:
      break;
    case DataActions.ADD_COMPONENT:
      break;
    case DataActions.ADD_LIST:
      break;
    case DataActions.ADD_CONDITION:
      break;
    case DataActions.UPDATE_CONDITION:
      break;
    case DataActions.REMOVE_CONDITION:
      break;
    case DataActions.ADD_LINK:
      break;
    case DataActions.UPDATE_LINK:
      break;
    case DataActions.ADD_PAGE:
      break;
    case DataActions.UPDATE_PAGE:
      break;
  }
}
