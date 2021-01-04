import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import {
  componentReducer,
  getSubReducer,
} from "../client/reducers/component/componentReducer";
import { Actions } from "../client/reducers/component/types";
import {
  metaReducer,
  optionsReducer,
  fieldsReducer,
  schemaReducer,
  componentListReducer,
  componentListItemReducer,
} from "../client/reducers/component";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, suite } = lab;

suite("Component reducer", () => {
  test("getSubReducer returns correct reducer", () => {
    const metaAction = Actions.NEW_COMPONENT,
      schemaAction = Actions.EDIT_SCHEMA_MIN,
      fieldsAction = Actions.EDIT_TITLE,
      optionsAction = Actions.EDIT_OPTIONS_HIDE_TITLE,
      listAction = Actions.EDIT_LIST,
      listItemAction = Actions.STATIC_LIST_ITEM_EDIT_VALUE;

    expect(getSubReducer(metaAction)).to.equal(metaReducer);
    expect(getSubReducer(schemaAction)).to.equal(schemaReducer);
    expect(getSubReducer(optionsAction)).to.equal(optionsReducer);
    expect(getSubReducer(fieldsAction)).to.equal(fieldsReducer);
    expect(getSubReducer(listAction)).to.equal(componentListReducer);
    expect(getSubReducer(listItemAction)).to.equal(componentListItemReducer);
  });

  test("componentReducer adds hasValidated flag correctly", () => {
    expect(
      componentReducer(
        {},
        { type: Actions.EDIT_TITLE, payload: "changing title" }
      )
    ).to.contain({
      hasValidated: false,
    });
  });
});
