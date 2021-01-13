import { Fields } from "./types";

export function fieldsReducer(
  state,
  action: {
    type: Fields;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedComponent } = state;

  switch (type) {
    case Fields.EDIT_CONTENT:
      return {
        selectedComponent: { ...selectedComponent, content: payload },
      };
    case Fields.EDIT_TITLE:
      return {
        selectedComponent: { ...selectedComponent, title: payload },
      };
    case Fields.EDIT_NAME: {
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          name: payload,
          nameHasError: /\s/g.test(payload),
        },
      };
    }
    case Fields.EDIT_TYPE: {
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          ...payload,
        },
      };
    }
    case Fields.EDIT_CONDITION:
      return {
        ...state,
        selectedComponent: { ...selectedComponent, condition: payload },
      };
    case Fields.EDIT_HELP:
      return {
        ...state,
        selectedComponent: { ...selectedComponent, hint: payload },
      };
  }
}
