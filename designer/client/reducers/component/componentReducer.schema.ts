import { Schema } from "./types";

export function schemaReducer(
  state,
  action: {
    type: Schema;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedComponent } = state;
  const { schema = {} } = selectedComponent;
  switch (type) {
    case Schema.EDIT_SCHEMA_MIN:
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

    case Schema.EDIT_SCHEMA_MAX:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          schema: { ...schema, max: payload },
        },
      };

    case Schema.EDIT_SCHEMA_PRECISION:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          schema: { ...schema, precision: payload },
        },
      };
    case Schema.EDIT_SCHEMA_LENGTH:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          schema: { ...schema, length: payload },
        },
      };
    case Schema.EDIT_SCHEMA_REGEX:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          schema: { ...schema, regex: payload },
        },
      };
  }
}
