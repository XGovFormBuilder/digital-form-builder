import { ConditionsWrapper } from "@xgovformbuilder/model/dist/browser/data-model";
import { ComponentDef, List, Page } from "@xgovformbuilder/model";

export type Path = Page["path"];
export type ConditionName = ConditionsWrapper["name"];
type ConditionDisplayName = Pick<ConditionsWrapper, "displayName">;

export enum DataActions {
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

  ADD_COMPONENT = "ADD_COMPONENT",
  UPDATE_COMPONENT = "UPDATE_COMPONENT",
}

type LinkAction = {
  type: DataActions.ADD_LINK | DataActions.UPDATE_LINK;
  payload: {
    from: Path;
    to: Path;
    condition?: ConditionName;
  };
};

type RemoveConditionAction = {
  type: DataActions.REMOVE_CONDITION;
  payload: ConditionDisplayName;
};

type AddConditionAction = {
  type: DataActions.ADD_CONDITION;
  payload: {
    name: ConditionName;
    condition: ConditionsWrapper;
  };
};

type UpdateConditionAction = {
  type: DataActions.UPDATE_CONDITION;
  payload: {
    name: ConditionName;
    condition: ConditionsWrapper;
  };
};

type ListAction = {
  type: DataActions.ADD_LIST;
  payload: List;
};

type AddPageAction = {
  type: DataActions.ADD_PAGE;
  payload: Page;
};

type UpdatePageAction = {
  type: DataActions.UPDATE_PAGE;
  payload: {
    path: Page["path"];
    updatedPage: Page;
  };
};

type UpdateComponent = {
  type: DataActions.UPDATE_COMPONENT;
  payload: {
    path: Page["path"];
    component: ComponentDef;
  };
};

type AddComponent = {
  type: DataActions.ADD_COMPONENT;
  payload: {
    path: Page["path"];
    componentName: ComponentDef["name"];
    component: ComponentDef;
  };
};
