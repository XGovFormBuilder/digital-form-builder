import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { ComponentDef, List, Page } from "@xgovformbuilder/model";

export type Path = Page["path"];
export type ConditionName = ConditionsWrapper["name"];
type ConditionDisplayName = Pick<ConditionsWrapper, "displayName">;

export enum DataActionType {
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

type LinkAction = {
  type: DataActionType.ADD_LINK | DataActionType.UPDATE_LINK;
  payload: {
    from: Path;
    to: Path;
    condition?: ConditionName;
  };
};

type RemoveCondition = {
  type: DataActionType.REMOVE_CONDITION;
  payload: ConditionDisplayName;
};

type AddConditionAction = {
  type: DataActionType.ADD_CONDITION;
  payload: {
    name: ConditionName;
    condition: ConditionsWrapper;
  };
};

type UpdateConditionAction = {
  type: DataActionType.UPDATE_CONDITION;
  payload: {
    name: ConditionName;
    condition: ConditionsWrapper;
  };
};

type ListAction = {
  type: DataActionType.ADD_LIST;
  payload: List;
};

type AddPageAction = {
  type: DataActionType.ADD_PAGE;
  payload: Page;
};

type UpdatePageAction = {
  type: DataActionType.UPDATE_PAGE;
  payload: {
    path: Page["path"];
    updatedPage: Page;
  };
};

type UpdateComponent = {
  type: DataActionType.UPDATE_COMPONENT;
  payload: {
    path: Page["path"];
    component: ComponentDef;
  };
};

type AddComponent = {
  type: DataActionType.ADD_COMPONENT;
  payload: {
    path: Page["path"];
    componentName: ComponentDef["name"];
    component: ComponentDef;
  };
};

export type DataAction =
  | LinkAction
  | RemoveCondition
  | AddConditionAction
  | UpdateConditionAction
  | ListAction
  | AddPageAction
  | UpdatePageAction
  | UpdateComponent
  | AddComponent;
