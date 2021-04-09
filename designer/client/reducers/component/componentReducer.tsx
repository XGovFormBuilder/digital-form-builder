import React, { useReducer, createContext } from "react";
import randomId from "../../randomId";
import { schemaReducer } from "./componentReducer.schema";
import { optionsReducer } from "./componentReducer.options";
import { metaReducer } from "./componentReducer.meta";
import { fieldsReducer } from "./componentReducer.fields";

import type { ComponentActions } from "./types";
import { Meta, Schema, Fields, Options, Actions } from "./types";

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
  const newName = randomId();
  return {
    selectedComponent: selectedComponent ?? { name: newName, options: {} },
    initialName: selectedComponent?.name ?? newName,
    pagePath: props?.pagePath,
    isNew: props?.isNew || ((selectedComponent?.name && false) ?? true),
    listItemErrors: {},
  };
};

export const ComponentContextProvider = (props) => {
  const { children, ...rest } = props;
  const [state, dispatch] = useReducer(
    componentReducer,
    initComponentState(rest)
  );

  return (
    <ComponentContext.Provider value={{ state, dispatch }}>
      {children}
    </ComponentContext.Provider>
  );
};
