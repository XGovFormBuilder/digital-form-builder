import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import { ComponentCreateList } from "../ComponentCreateList";
import { initI18n } from "../../../i18n/i18n";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test, after } = lab;

initI18n();

suite("ComponentCreateList", () => {
  let onSelectComponent;

  beforeEach(() => {
    sinon.resetHistory();
    onSelectComponent = sinon.stub();
  });

  after(() => {
    sinon.restore();
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
      "UK address field",
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
      "Select field",
      "YesNo field",
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
});
