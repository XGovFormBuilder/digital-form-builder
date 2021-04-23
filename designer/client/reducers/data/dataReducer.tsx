import { DataAction, DataActionType } from "./types";
import { addComponent, updateComponent } from "./component";
import { addLink, updateLink } from "./page";
import { RawData } from "@xgovformbuilder/model";
import { updateCondition } from "../condition";

function reducer(state: RawData, action: DataAction): RawData {
  const data = { ...state };

  switch (action.type) {
    case DataActionType.UPDATE_COMPONENT: {
      const { path, component, componentName } = action.payload;
      return updateComponent(data, path, componentName, component);
    }
    case DataActionType.ADD_COMPONENT: {
      const { path, component } = action.payload;
      return addComponent(data, path, component);
    }
    case DataActionType.ADD_LIST: {
      return { ...data, lists: [...data.lists, action.payload] };
    }
    case DataActionType.ADD_CONDITION: {
      const { conditionName, condition } = action.payload;
      if (
        data.conditions?.find((condition) => condition.name === conditionName)
      ) {
        throw Error(`A condition already exists with name ${conditionName}`);
      }
      return { ...data, conditions: [...(data.conditions ?? []), condition] };
    }
    case DataActionType.UPDATE_CONDITION: {
      const { name, condition } = action.payload;
      return updateCondition(data, name, condition);
    }
    case DataActionType.REMOVE_CONDITION:
      break;
    case DataActionType.ADD_LINK: {
      const { from, to, condition } = action.payload;
      return addLink(data, from, to, condition);
    }
    case DataActionType.UPDATE_LINK:
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
