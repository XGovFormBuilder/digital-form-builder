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
  Actions,
} from "./types";
import { componentListReducer } from "./componentReducer.list";

// TODO: type
type ComponentState = {
  [prop: string]: any;
};

const defaultValues = {};

export const ComponentContext = createContext<{
  state: ComponentState;
  dispatch: React.Dispatch<any>;
}>({
  state: defaultValues,
  dispatch: () => {},
});

const ActionsReducerCollection = [
  [Meta, metaReducer],
  [Options, optionsReducer],
  [Fields, fieldsReducer],
  [Schema, schemaReducer],
  [ComponentList, componentListReducer],
  [StaticListItem, componentListItemReducer],
];

export function valueIsInEnum<T>(value: keyof ComponentActions, enumType: T) {
  return Object.values(enumType).indexOf(value) !== -1;
}

export function getSubReducer(type) {
  return ActionsReducerCollection.find((a) => valueIsInEnum(type, a[0]))?.[1];
}

const isNotValidate = (type): type is Meta.VALIDATE => {
  return Object.values(Actions).includes(type);
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
  console.info(type);

  if (isNotValidate(type)) {
    state.hasValidated = false;
  }

  const subReducer: any = getSubReducer(type);

  if (subReducer) {
    return {
      ...state,
      ...subReducer(state, action),
    };
  } else {
    console.error("Unrecognised action:", action.type);
    return { ...state, selectedComponent };
  }
}

export const initComponentState = (props) => {
  const selectedComponent = props?.component;
  const newName = nanoid(6);
  const init = {
    selectedComponent: selectedComponent ?? { name: newName, options: {} },
    initialName: selectedComponent?.name ?? newName,
    selectedListName: selectedComponent?.values?.list ?? "static",
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
  const { children, ...rest } = props;
  const [state, dispatch] = useReducer(
    componentReducer,
    initComponentState(rest)
  );
  console.info(state);
  return (
    <ComponentContext.Provider value={{ state, dispatch }}>
      {children}
    </ComponentContext.Provider>
  );
};
