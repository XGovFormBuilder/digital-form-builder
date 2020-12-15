import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import ConditionEdit from "../client/condition-edit";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";
import { assertTextInput } from "./helpers/element-assertions";
import { metaReducer } from "../client/reducers/component/componentReducer.meta";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, beforeEach } = lab;

suite("Component reducer", () => {
  let reducer;
  beforeEach(() => {
    reducer = metaReducer;
  });
  test("Meta Action with payload returns correct state", () => {});
});
