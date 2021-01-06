import React, { useReducer, createContext } from "react";
import { nanoid } from "nanoid";
import { schemaReducer } from "./componentReducer.schema";
import { optionsReducer } from "./componentReducer.options";
import { metaReducer } from "./componentReducer.meta";
import { fieldsReducer } from "./componentReducer.fields";
import { componentListItemReducer } from "./componentReducer.listItem";

import type { ComponentActions } from "./types";
import {
  Meta,
  Schema,
  Fields,
  Options,
  ComponentList,
  StaticListItem,
} from "./types";
import { componentListReducer } from "./componentReducer.list";

export const ComponentContext = createContext({});

const ActionsReducerCollection = [
  [Meta, metaReducer],
  [Options, optionsReducer],
  [Fields, fieldsReducer],
  [Schema, schemaReducer],
  [ComponentList, componentListReducer],
  [StaticListItem, componentListItemReducer],
];

export function valueIsInEnum<T>(value: string, enumType: T) {
  return Object.values(enumType).indexOf(value) !== -1;
}

export const getSubReducer = (type) => {
  const tuple = ActionsReducerCollection.find((a) => valueIsInEnum(type, a[0]));
  return tuple?.[1];
};

export function componentReducer(
  state,
  action: {
    type: ComponentActions;
    payload: any;
  }
) {
  const { type } = action;

  const { selectedComponent } = state;
  if (type !== Meta.VALIDATE) {
    state.hasValidated = false;
  }

  const subReducer = getSubReducer(type);

  if (subReducer) {
    return {
      ...state,
      ...subReducer(state, action),
    };
  } else {
    console.error("Unrecognised action");
    return { ...state, selectedComponent };
  }
}

export const initComponentState = (props) => {
  const selectedComponent = props?.component;
  const newName = nanoid(6);
  const init = {
    selectedComponent: selectedComponent ?? { name: newName, options: {} },
    initialName: selectedComponent?.name ?? newName,
    selectedListName: undefined,
    pagePath: props?.pagePath,
    isNew: props?.isNew || ((selectedComponent?.name && false) ?? true),
    listItemErrors: {},
  };
  if (!!selectedComponent) {
    init.selectedListName =
      selectedComponent.values?.type === "static"
        ? "static"
        : selectedComponent.values?.list;
  }
  return init;
};

export const ComponentContextProvider = (props) => {
  const { children: c, ...rest } = props;
  const [state, dispatch] = useReducer(
    componentReducer,
    initComponentState(rest)
  );

  return (
    <ComponentContext.Provider value={[state, dispatch]}>
      {c}
    </ComponentContext.Provider>
  );
};
