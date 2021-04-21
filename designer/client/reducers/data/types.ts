import {
  ConditionsWrapper,
  ConditionRawData,
} from "@xgovformbuilder/model/dist/browser";
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

export type DataAction =
  | {
      type: DataActionType.ADD_LINK | DataActionType.UPDATE_LINK;
      from: Path;
      to: Path;
      condition?: ConditionName;
    }
  | {
      type: DataActionType.REMOVE_CONDITION;
      conditionName: ConditionDisplayName;
    }
  | {
      type: DataActionType.ADD_CONDITION;
      payload: {
        conditionName: ConditionName;
        condition: ConditionRawData;
      };
    }
  | {
      type: DataActionType.UPDATE_CONDITION;
      payload: {
        name: ConditionName;
        condition: ConditionRawData;
      };
    }
  | {
      type: DataActionType.ADD_LIST;
      list: List;
    }
  | {
      type: DataActionType.ADD_PAGE;
      payload: Page;
    }
  | {
      type: DataActionType.UPDATE_PAGE;
      payload: {
        path: Page["path"];
        updatedPage: Page;
      };
    }
  | {
      type: DataActionType.UPDATE_COMPONENT;
      payload: {
        path: Page["path"];
        component: ComponentDef;
      };
    }
  | {
      type: DataActionType.ADD_COMPONENT;
      payload: {
        path: Page["path"];
        componentName: ComponentDef["name"];
        component: ComponentDef;
      };
    };
