import sinon from "sinon";
import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import ConditionEdit from "../client/condition-edit";
import * as Component from "../client/reducers/component/componentReducer";
import { TextFieldEdit } from "../client/component-editors/text-field-edit";
import FieldEdit from "../client/field-edit";
import { Textarea } from "@govuk-jsx/textarea";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { describe, test, beforeEach, suite, experiment } = lab;

experiment("Component editors", () => {
  suite("FieldEdit renders correctly when", () => {
    const wrapper = mount(
      <Component.ComponentContextProvider>
        <FieldEdit />
      </Component.ComponentContextProvider>
    );

    const reducerSpy = sinon.spy(Component, "componentReducer");

    test("title changes", () => {
      const newTitle = "test title";
      const field = wrapper.find("#field-title");
      field.simulate("change", { target: { value: newTitle } });
      expect(wrapper.find("#field-title").props().value).to.equal(newTitle);
    });

    test("name changes", () => {
      const newName = "the-new-name";
      const field = () => wrapper.find("#field-name").first();
      field().simulate("change", { target: { value: newName } });
      expect(field().props().value).to.equal(newName);
    });

    test("help changes", () => {
      const newHelp = "help";
      const field = () => wrapper.find("#field-hint").first();
      field().simulate("change", { target: { value: newHelp } });
      expect(field().props().value).to.equal(newHelp);
    });

    test("hide title is checked", () => {
      const field = wrapper.find("#field-options-optionalText");
      field.simulate("change", { target: { checked: true } });
      expect(field.props().checked).to.equal(false);
    });

    test("reducer called correctly", () => {
      console.log("reducer spy", reducerSpy);
    });
  });
  suite("TextField renders correctly when", () => {
    const wrapper = mount(
      <Component.ComponentContextProvider>
        <TextFieldEdit />
      </Component.ComponentContextProvider>
    );

    test("schema max length changes", () => {
      const field = () => wrapper.find("#field-schema-length").first();
      const length = 1337;
      field().simulate("change", { target: { value: length } });
      expect(field().props().value).to.equal(length);
    });

    test("schema min length changes", () => {
      const field = () => wrapper.find("#field-schema-min").first();
      const length = 42;
      field().simulate("change", { target: { value: length } });
      expect(field().props().value).to.equal(length);
    });

    test("schema max length changes", () => {
      const field = () => wrapper.find("#field-schema-max").first();
      const length = 42;
      field().simulate("change", { target: { value: length } });
      expect(field().props().value).to.equal(length);
    });

    test("schema regex changes", () => {
      const field = () => wrapper.find("#field-schema-regex");
      const regex = "/ab+c/";
      field().simulate("change", { target: { value: regex } });
      expect(field().props().value).to.equal(regex);
    });
  });
});
