import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import { ComponentCreateList } from "../ComponentCreateList";
import * as i18Module from "../../../i18n/i18n";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, afterEach, suite, test } = lab;

const sandbox = sinon.createSandbox();

suite("ComponentCreateList", () => {
  let onSelectComponent;

  beforeEach(() => {
    onSelectComponent = sandbox.stub();
    sandbox.stub(i18Module, "i18n").returns("TEST TRANSLATION");
  });

  afterEach(() => {
    sandbox.restore();
  });

  test("it displays Content components list correctly", () => {
    const wrapper = shallow(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );

    const contentComponentsList = wrapper.find("ol").at(1);
    const listItems = contentComponentsList.find("li").map((c) => c.text());

    expect(listItems).to.equal([
      "Details",
      "Flash card",
      "Html",
      "Inset text",
      "List",
      "Paragraph",
    ]);
  });

  test("it selects Content components on click", () => {
    const wrapper = shallow(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );

    const contentComponentsList = wrapper.find("ol").at(1);
    const listItems = contentComponentsList.find("li");

    listItems.forEach((item) => {
      expect(item.find("a").prop("onClick")).to.be.a.function();
    });

    listItems.forEach((item) =>
      item.find("a").simulate("click", { preventDefault: sinon.stub() })
    );

    expect(onSelectComponent.getCalls().length).to.equal(listItems.length);
    expect(onSelectComponent.getCall(0).args[0]).to.equal({
      name: "Details",
      type: "Details",
      title: "Details",
      subType: "content",
      content: "",
      options: {},
      schema: {},
    });
  });

  test("it displays Input fields list correctly", () => {
    const wrapper = shallow(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );

    const contentComponentsList = wrapper.find("ol").at(2);
    const listItems = contentComponentsList.find("li").map((c) => c.text());

    expect(listItems).to.equal([
      "Autocomplete field",
      "Date field",
      "Date parts field",
      "Date time field",
      "Date time parts field",
      "Email address field",
      "File upload field",
      "Multiline text field",
      "Number field",
      "Telephone number field",
      "Text field",
      "Time field",
      "Uk address field",
    ]);
  });

  test("it selects Input components on click", () => {
    const wrapper = shallow(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );

    const contentComponentsList = wrapper.find("ol").at(2);
    const listItems = contentComponentsList.find("li");

    listItems.forEach((item) => {
      expect(item.find("a").prop("onClick")).to.be.a.function();
    });

    listItems.forEach((item) =>
      item.find("a").simulate("click", { preventDefault: sinon.stub() })
    );

    expect(onSelectComponent.getCalls().length).to.equal(listItems.length);
    expect(onSelectComponent.getCall(0).args[0]).to.equal({
      name: "AutocompleteField",
      type: "AutocompleteField",
      title: "Autocomplete field",
      subType: "field",
      options: {},
      schema: {},
    });
  });

  test("it displays Selection fields list correctly", () => {
    const wrapper = shallow(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );

    const contentComponentsList = wrapper.find("ol").at(3);
    const listItems = contentComponentsList.find("li").map((c) => c.text());

    expect(listItems).to.equal([
      "Checkboxes field",
      "Radios field",
      "SelectField",
      "Yes/No field",
    ]);
  });

  test("it selects Selection fields on click", () => {
    const wrapper = shallow(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );

    const contentComponentsList = wrapper.find("ol").at(3);
    const listItems = contentComponentsList.find("li");

    listItems.forEach((item) => {
      expect(item.find("a").prop("onClick")).to.be.a.function();
    });

    listItems.forEach((item) =>
      item.find("a").simulate("click", { preventDefault: sinon.stub() })
    );

    expect(onSelectComponent.getCalls().length).to.equal(listItems.length);
    expect(onSelectComponent.getCall(0).args[0]).to.equal({
      name: "CheckboxesField",
      type: "CheckboxesField",
      title: "Checkboxes field",
      subType: "field",
      options: {},
      schema: {},
    });
  });

  test("It translates expected strings", () => {
    shallow(<ComponentCreateList onSelectComponent={onSelectComponent} />);

    // @ts-ignore
    const i18nTranslations = i18Module.i18n.getCalls().map((c) => c.args[0]);
    expect(i18nTranslations).to.equal([
      "Select a component to add to your page",
      "Content",
      "Input fields",
      "Selection fields",
    ]);
  });
});
