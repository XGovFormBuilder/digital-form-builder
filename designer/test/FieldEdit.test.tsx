import React from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { ComponentContextProvider } from "../client/reducers/component/componentReducer";
import { FieldEdit } from "../client/field-edit";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, suite } = lab;

suite("FieldEdit renders correctly when", () => {
  const wrapper = mount(
    <ComponentContextProvider>
      <FieldEdit />
    </ComponentContextProvider>
  );

  test.skip("title changes", () => {
    //FIXME:- govuk jsx >:(
    const newTitle = "test title";
    const field = () => wrapper.find("#field-title").first();
    field().simulate("change", { target: { value: newTitle } });
    wrapper.update();
    expect(field().props().value).to.equal(newTitle);
  });

  test("name changes", () => {
    const newName = "the-new-name";
    const field = () => wrapper.find("#field-name").first();
    field().simulate("change", { target: { value: newName } });
    expect(field().props().value).to.equal(newName);
  });

  test.skip("help changes", () => {
    //FIXME:- govuk jsx >:(
    const newHelp = "help";
    const field = () => wrapper.find("#field-hint").first();
    field().simulate("change", { target: { value: newHelp } });
    wrapper.update();

    expect(field().props().value).to.equal(newHelp);
  });

  test("hide title is checked", () => {
    const field = wrapper.find("#field-options-optionalText");
    field.simulate("change", { target: { checked: true } });
    expect(field.props().checked).to.equal(false);
  });
});
