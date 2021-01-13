import { Options } from "./types";

export function optionsReducer(
  state,
  action: {
    type: Options;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedComponent } = state;
  const { options } = state;
  switch (type) {
    case Options.EDIT_OPTIONS_HIDE_TITLE:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, hideTitle: payload },
        },
      };
    case Options.EDIT_OPTIONS_REQUIRED:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, required: payload },
        },
      };
    case Options.EDIT_OPTIONS_ROWS:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, rows: payload },
        },
      };

    case Options.EDIT_OPTIONS_HIDE_OPTIONAL:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, optionalText: payload },
        },
      };
    case Options.EDIT_OPTIONS_FILE_UPLOAD_MULTIPLE:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, multiple: payload },
        },
      };
    case Options.EDIT_OPTIONS_CLASSES:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, classes: payload },
        },
      };

    case Options.EDIT_OPTIONS_MAX_DAYS_IN_FUTURE:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, maxDaysInFuture: payload },
        },
      };
    case Options.EDIT_OPTIONS_MAX_DAYS_IN_PAST:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, maxDaysInPast: payload },
        },
      };
    case Options.EDIT_OPTIONS_CONDITION:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, condition: payload },
        },
      };

    case Options.EDIT_OPTIONS_TYPE:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, type: payload },
        },
      };
  }
}
