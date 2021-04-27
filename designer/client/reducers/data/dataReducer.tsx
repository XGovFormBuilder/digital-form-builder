import { DataAction, DataActionType } from "./types";
import { addComponent, updateComponent } from "../../data/component";
import { addLink, updateLink } from "../../data/page";
import { FormDefinition } from "@xgovformbuilder/model";
import { removeCondition, updateCondition } from "../condition";

export function dataReducer(
  state: FormDefinition,
  action: DataAction
): FormDefinition {
  const data = { ...state };

  switch (action.type) {
    case DataActionType.UPDATE_COMPONENT: {
      //replacement for Data.updateComponent
      const { path, component, componentName } = action.payload;
      return updateComponent(data, path, componentName, component);
    }
    case DataActionType.ADD_COMPONENT: {
      //replacement for Data.addComponent

      const { path, component } = action.payload;
      return addComponent(data, path, component);
    }
    case DataActionType.ADD_LIST: {
      //replacement for Data.addList

      return { ...data, lists: [...data.lists, action.payload] };
    }
    case DataActionType.ADD_CONDITION: {
      //replacement for Data.addCondition
      const { conditionName, condition } = action.payload;
      if (
        data.conditions?.find((condition) => condition.name === conditionName)
      ) {
        throw Error(`A condition already exists with name ${conditionName}`);
      }
      return { ...data, conditions: [...(data.conditions ?? []), condition] };
    }
    case DataActionType.UPDATE_CONDITION: {
      //replacement for Data.updateCondition

      const { name, condition } = action.payload;
      return updateCondition(data, name, condition);
    }
    case DataActionType.REMOVE_CONDITION:
      //replacement for Data.removeCondition
      return removeCondition(data, action.payload);
    case DataActionType.ADD_LINK: {
      //replacement for Data.addLink
      const { from, to, condition } = action.payload;
      return addLink(data, from, to, condition);
    }
    case DataActionType.UPDATE_LINK:
      //replacement for Data.updateLink
      const { from, to, condition } = action.payload;
      return updateLink(data, from, to, condition) ?? data;
    case DataActionType.ADD_PAGE: {
      return {
        ...data,
        pages: [...data.pages, action.payload],
      };
    }
  }
}
