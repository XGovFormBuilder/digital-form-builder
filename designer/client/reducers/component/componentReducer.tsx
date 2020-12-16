import React, { useReducer, createContext } from "react";
import { ListActions } from "../listActions";
import { nanoid } from "nanoid";
import { schemaReducer } from "./componentReducer.schema";
import { optionsReducer } from "./componentReducer.options";
import { metaReducer } from "./componentReducer.meta";
import { fieldsReducer } from "./componentReducer.fields";
import type { ComponentActions } from "./types";
import { Meta, Schema, Fields, Options } from "./types";

export const ComponentContext = createContext({});

enum List {
  ADD_STATIC_LIST = "ADD_STATIC_LIST",
}

const ActionsArr = [
  [Meta, metaReducer],
  [Options, optionsReducer],
  [Fields, fieldsReducer],
  [Schema, schemaReducer],
];

export function valueIsInEnum<T>(value: string, enumType: T) {
  return Object.values(enumType).indexOf(value) !== -1;
}

const initStaticItem = () => {
  return {
    isNew: true,
    label: "",
    hint: "",
    condition: "",
  };
};

const getSubReducer = (type) => {
  const tuple = ActionsArr.find((a) => valueIsInEnum(type, a[0]));
  return tuple?.[1];
};

export function componentReducer(
  state,
  action: {
    type: ComponentActions | ListActions;
    payload: any;
  }
) {
  const { type, payload } = action;
  const {
    selectedComponent = {
      options: {
        required: true,
        hideTitle: false,
        optionalText: false,
        classes: "",
      },
      schema: {},
    },
    selectedListItem = {},
    selectedListItemIndex,
  } = state;
  let staticListItems = selectedComponent.values?.items;

  const { options, schema = {} } = selectedComponent;

  if (type !== Meta.VALIDATE) {
    state.hasValidated = false;
  }

  const subReducer = getSubReducer(type);
  console.log("subreducer is ", subReducer);

  if (subReducer) {
    return {
      ...state,
      ...subReducer(state, action),
    };
  } else {
    switch (type) {
      case ListActions.EDIT_LIST_ITEM_CONDITION:
        break;
      case ListActions.SUBMIT_LIST_ITEM:
        return { ...state, selectedComponent };
      case ListActions.ADD_LIST_ITEM:
        return { ...state, selectedItem: initStaticItem() };

      case ListActions.EDIT_LIST_ITEM:
        let selectedItem, selectedItemIndex;
        if (typeof payload === "number") {
          selectedItem = staticListItems[payload];
        } else {
          selectedItem = payload;
          selectedItemIndex = staticListItems.findIndex(
            (item) => item === payload
          );
        }
        return {
          ...state,
          selectedItem,
          selectedItemIndex,
        };
      case ListActions.EDIT_LIST:
        return {
          ...state,
          isEditingList: payload,
        };
      case ListActions.SET_SELECTED_LIST:
        if (state.isNew) {
          return {
            ...state,
            selectedComponent: {
              values: {
                type: "listRef",
                list: payload,
              },
              ...selectedComponent,
            },
            selectedListName: payload,
            listItemErrors: {},
          };
        } else {
          // this is not changing component.values right now, since we don't want to "lose" static values.
          return {
            ...state,
            selectedListName: payload,
            listItemErrors: {},
          };
        }

      case ListActions.LIST_ITEM_VALIDATION_ERRORS: {
        return {
          ...state,
          listItemErrors: payload,
        };
      }

      default:
        return { ...state, selectedComponent };
    }
  }
}

const initComponentState = (props) => {
  const selectedComponent = props?.component;
  const newName = nanoid(6);
  const init = {
    selectedComponent: selectedComponent ?? { name: newName, options: {} },
    initialName: selectedComponent?.name ?? newName,
    selectedListName: undefined,
    pagePath: props?.pagePath,
    isNew: props.isNew || ((selectedComponent?.name && false) ?? true),
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
  const [state, dispatch] = useReducer(
    componentReducer,
    initComponentState(props)
  );
  // console.log("component context", state);

  return (
    <ComponentContext.Provider value={[state, dispatch]}>
      {props.children}
    </ComponentContext.Provider>
  );
};
