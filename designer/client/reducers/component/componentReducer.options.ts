import { Options } from "./types";

interface ConditionAction {
  type: Options.EDIT_OPTIONS_CONDITION;
  payload: string;
}

interface AnyAction {
  type: Options;
  payload: any;
}

type OptionsActions = ConditionAction | AnyAction;

export function optionsReducer(state, action: OptionsActions) {
  const { type, payload } = action;
  const { selectedComponent } = state;
  const { options } = selectedComponent;
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
    case Options.EDIT_OPTIONS_AUTOCOMPLETE:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, autocomplete: payload },
        },
      };
    case Options.EDIT_OPTIONS_PREFIX:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, prefix: payload },
        },
      };
    case Options.EDIT_OPTIONS_SUFFIX:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, suffix: payload },
        },
      };
    case Options.EDIT_OPTIONS_CUSTOM_MESSAGE:
      return {
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, customValidationMessage: payload },
        },
      };

    case Options.EDIT_OPTIONS_MAX_WORDS:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, maxWords: payload },
        },
      };
    case Options.EDIT_OPTIONS_MAX_FILE_UPLOAD_AMOUNT:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: {
            ...options,
            dropzoneConfig: {
              ...options.dropzoneConfig,
              maxFiles: payload,
            },
          },
        },
      };
    case Options.EDIT_OPTIONS_PARALLEL_UPLOAD_AMOUNT:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: {
            ...options,
            dropzoneConfig: {
              ...options.dropzoneConfig,
              parallelUploads: payload,
            },
          },
        },
      };
    case Options.EDIT_OPTIONS_MAX_FILE_SIZE:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: {
            ...options,
            dropzoneConfig: {
              ...options.dropzoneConfig,
              maxFilesize: payload,
            },
          },
        },
      };
    case Options.EDIT_OPTIONS_ACCEPTED_FILES:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: {
            ...options,
            dropzoneConfig: {
              ...options.dropzoneConfig,
              acceptedFiles: payload,
            },
          },
        },
      };
    case Options.EDIT_OPTIONS_SHOW_SCRIPT_WARNING:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, showNoScriptWarning: payload },
        },
      };
    case Options.EDIT_OPTIONS_MIN_REQUIRED_FILES:
      return {
        ...state,
        selectedComponent: {
          ...selectedComponent,
          options: { ...options, minimumRequiredFiles: payload },
        },
      };
  }
}
