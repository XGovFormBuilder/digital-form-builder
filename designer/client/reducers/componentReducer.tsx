import React, { useReducer, createContext } from "react";
import { ListActions } from "./listActions";
import { nanoid } from "nanoid";
import {
  StaticListItemActions,
  staticListItemReducer,
} from "./staticListItemReducer";
import { validateComponent } from "./componentReducer.validations";
export const ComponentContext = createContext({});

export enum ComponentActions {
  NEW_COMPONENT = "NEW_COMPONENT",
  SET_COMPONENT = "SET_COMPONENT",
  SET_PAGE = "SET_PAGE",

  EDIT_TITLE = "EDIT_TITLE",
  EDIT_NAME = "EDIT_NAME",
  EDIT_CONDITION = "EDIT_CONDITION",
  EDIT_HELP = "EDIT_HELP",
  EDIT_CONTENT = "EDIT_CONTENT",
  EDIT_TYPE = "EDIT_TYPE",

  EDIT_OPTIONS_HIDE_TITLE = "EDIT_OPTIONS_HIDE_TITLE",
  EDIT_OPTIONS_REQUIRED = "EDIT_OPTIONS_REQUIRED",
  EDIT_OPTIONS_HIDE_OPTIONAL = "EDIT_OPTIONS_HIDE_OPTIONAL",
  EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE = "EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE",
  EDIT_OPTIONS_CLASSES = "EDIT_OPTIONS_CLASSES",
  EDIT_OPTIONS_MAX_DAYS_IN_FUTURE = "EDIT_OPTIONS_MAX_DAYS_IN_FUTURE",
  EDIT_OPTIONS_MAX_DAYS_IN_PAST = "EDIT_OPTIONS_MAX_DAYS_IN_PAST",
  EDIT_OPTIONS_CONDITION = "EDIT_OPTIONS_CONDITION",
  EDIT_OPTIONS_TYPE = "EDIT_OPTIONS_TYPE",

  EDIT_SCHEMA_MIN = "EDIT_SCHEMA_MIN",
  EDIT_SCHEMA_MAX = "EDIT_SCHEMA_MAX",
  EDIT_SCHEMA_PRECISION = "EDIT_SCHEMA_PRECISION",
  EDIT_SCHEMA_LENGTH = "EDIT_SCHEMA_LENGTH",
  EDIT_SCHEMA_REGEX = "EDIT_SCHEMA_REGEX",
  EDIT_SCHEMA_ROWS = "EDIT_SCHEMA_ROWS",

  ADD_STATIC_LIST = "ADD_STATIC_LIST",

  SUBMIT = "SUBMIT",
  DELETE = "DELETE",

  SHOULD_VALIDATE = "SHOULD_VALIDATE",
}

function valueIsInEnum<T>(value: string, enumType: T): value is T {
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

export function componentReducer(
  state,
  action: {
    type: ComponentActions | ListActions | StaticListItemActions;
    payload: any;
  }
) {
  const { type, payload } = action;
  console.log("component reducer", type, payload);
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
    errors = {},
  } = state;
  let staticListItems = selectedComponent.values?.items;

  const { options, schema = {} } = selectedComponent;
  if (valueIsInEnum(type, StaticListItemActions)) {
    return staticListItemReducer(state, action);
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

      case ComponentActions.NEW_COMPONENT:
        return {
          ...state,
          selectedComponent: {
            name: nanoid(6),
            title: "",
            schema: {},
            options: { required: true },
          },
        };

      case ComponentActions.SET_COMPONENT:
        return { ...state, selectedComponent: payload };

      case ComponentActions.SET_PAGE:
        return { ...state, pagePath: payload };

      case ComponentActions.EDIT_CONTENT:
        return {
          ...state,
          selectedComponent: { ...selectedComponent, content: payload },
        };
      case ComponentActions.EDIT_TITLE:
        return {
          ...state,
          selectedComponent: { ...selectedComponent, title: payload },
        };
      case ComponentActions.EDIT_NAME: {
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            name: payload,
            nameHasError: /\s/g.test(payload),
          },
        };
      }
      case ComponentActions.EDIT_TYPE:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            type: payload,
          },
        };
      case ComponentActions.EDIT_CONDITION:
        return {
          ...state,
          selectedComponent: { ...selectedComponent, condition: payload },
        };
      case ComponentActions.EDIT_HELP:
        return {
          ...state,
          selectedComponent: { ...selectedComponent, hint: payload },
        };
      case ComponentActions.EDIT_OPTIONS_HIDE_TITLE:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, hideTitle: payload },
          },
        };
      case ComponentActions.EDIT_OPTIONS_REQUIRED:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: {
              ...options,
              required:
                selectedComponent.type === "FileUploadField" ? false : payload,
            },
          },
        };
      case ComponentActions.EDIT_OPTIONS_HIDE_OPTIONAL:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, optionalText: payload },
          },
        };
      case ComponentActions.EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, multiple: payload },
          },
        };
      case ComponentActions.EDIT_OPTIONS_CLASSES:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, classes: payload },
          },
        };

      case ComponentActions.EDIT_OPTIONS_MAX_DAYS_IN_FUTURE:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, maxDaysInFuture: payload },
          },
        };
      case ComponentActions.EDIT_OPTIONS_MAX_DAYS_IN_PAST:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, maxDaysInPast: payload },
          },
        };
      case ComponentActions.EDIT_OPTIONS_CONDITION:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, condition: payload },
          },
        };

      case ComponentActions.EDIT_OPTIONS_TYPE:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            options: { ...options, type: payload },
          },
        };

      case ComponentActions.EDIT_SCHEMA_MIN:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            schema: {
              ...schema,
              min: payload,
            },
          },
        };

      case ComponentActions.EDIT_SCHEMA_MAX:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            schema: { ...schema, max: payload },
          },
        };

      case ComponentActions.EDIT_SCHEMA_ROWS:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            schema: { ...schema, rows: payload },
          },
        };

      case ComponentActions.EDIT_SCHEMA_PRECISION:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            schema: { ...schema, precision: payload },
          },
        };
      case ComponentActions.EDIT_SCHEMA_LENGTH:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            schema: { ...schema, length: payload },
          },
        };
      case ComponentActions.EDIT_SCHEMA_REGEX:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            schema: { ...schema, regex: payload },
          },
        };

      case ComponentActions.ADD_STATIC_LIST:
        return {
          ...state,
          selectedComponent: {
            ...selectedComponent,
            values: { type: "static", items: [] },
          },
          selectedListName: "static",
        };

      case ComponentActions.SUBMIT:
        break;

      case ComponentActions.DELETE:
        if (state.showDeleteWarning) {
          delete state.selectedComponent;
        } else {
          return { ...state, showDeleteWarning: true };
        }

        break;

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
          };
        } else {
          // this is not changing component.values right now, since we don't want to "lose" static values.
          return {
            ...state,
            selectedListName: payload,
          };
        }

      case ComponentActions.SHOULD_VALIDATE:
        return validateComponent(state);

      default:
        return { ...state, selectedComponent };
    }
  }
}

const initComponentState = (props) => {
  const selectedComponent = props?.component;
  const newName = nanoid(6);
  const init = {
    selectedComponent: selectedComponent ?? { name: newName },
    initialName: selectedComponent?.name ?? newName,
    selectedListName: undefined,
    pagePath: props?.pagePath,
    isNew: props.isNew || ((selectedComponent?.name && false) ?? true),
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
  console.log("component context", state);

  return (
    <ComponentContext.Provider value={[state, dispatch]}>
      {props.children}
    </ComponentContext.Provider>
  );
};
