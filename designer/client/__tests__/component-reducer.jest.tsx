import { Actions } from "../reducers/component/types";
import {
  metaReducer,
  optionsReducer,
  fieldsReducer,
  schemaReducer,
} from "../reducers/component";
import {
  componentReducer,
  getSubReducer,
} from "../reducers/component/componentReducer";

describe("Component reducer", () => {
  test("getSubReducer returns correct reducer", () => {
    const metaAction = Actions.NEW_COMPONENT,
      schemaAction = Actions.EDIT_SCHEMA_MIN,
      fieldsAction = Actions.EDIT_TITLE,
      optionsAction = Actions.EDIT_OPTIONS_HIDE_TITLE;

    expect(getSubReducer(metaAction)).toBe(metaReducer);
    expect(getSubReducer(schemaAction)).toBe(schemaReducer);
    expect(getSubReducer(optionsAction)).toBe(optionsReducer);
    expect(getSubReducer(fieldsAction)).toBe(fieldsReducer);
  });

  test("componentReducer adds hasValidated flag correctly", () => {
    expect(
      componentReducer(
        {},
        { type: Actions.EDIT_TITLE, payload: "changing title" }
      )
    ).toMatchObject({ hasValidated: false });
  });
});
