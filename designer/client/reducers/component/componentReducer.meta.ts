import { Meta } from "./types";

import { fieldComponentValidations } from "./componentReducer.validations";
import { nanoid } from "nanoid";

export function metaReducer(
  state,
  action: {
    type: Meta;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedComponent } = state;
  switch (type) {
    case Meta.NEW_COMPONENT:
      return {
        ...state,
        selectedComponent: {
          name: nanoid(6),
          title: "",
          schema: {},
          options: { required: true },
        },
      };
    case Meta.SET_COMPONENT:
      return { ...state, selectedComponent: payload, errors: {} };
    case Meta.SET_PAGE:
      return { ...state, pagePath: payload };
    case Meta.DELETE:
      if (state.showDeleteWarning) {
        delete state.selectedComponent;
      } else {
        return { ...state, showDeleteWarning: true };
      }
      break;
    case Meta.VALIDATE:
      return {
        ...state,
        errors: fieldComponentValidations(selectedComponent),
        hasValidated: true,
      };
  }
}
