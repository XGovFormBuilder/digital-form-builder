import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import PageEdit from "../client/page-edit";
import { ErrorSummary } from "../client/error-summary";
import { Data } from "@xgovformbuilder/model";
import {
  assertTextInput,
  assertSelectInput,
} from "./helpers/element-assertions";
import {
  assertInputControlValue,
  assertInputControlProp,
} from "./helpers/sub-component-assertions";
import { Input } from "@govuk-jsx/input";
import { initI18n } from "../client/i18n";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, before } = lab;

suite("Page edit", () => {
  before(() => {
    initI18n();
  });

  test("Renders a form with the appropriate initial inputs", () => {
    const data = new Data({
      pages: [
        {
          path: "/1",
          title: "My first page",
          section: "badger",
          controller: "./pages/start.js",
        },
      ],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const page = Object.assign(data.pages[0], { section: data.sections[0] });

    const wrapper = shallow(<PageEdit data={data} page={page} />).dive();

    assertSelectInput({
      wrapper: wrapper.find("#page-type"),
      id: "page-type",
      expectedFieldOptions: [
        { value: "", text: "Question page" },
        { value: "./pages/start.js", text: "Start page" },
        { value: "./pages/summary.js", text: "Summary page" },
      ],
      expectedValue: "./pages/start.js",
    });

    assertInputControlValue({
      wrapper,
      id: "page-title",
      expectedValue: "My first page",
    });

    assertInputControlValue({
      wrapper,
      id: "page-path",
      expectedValue: "/1",
    });

    assertSelectInput({
      wrapper: wrapper.find("#page-section"),
      id: "page-section",
      expectedFieldOptions: [
        { text: "" },
        { value: "badger", text: "Badger" },
        { value: "personalDetails", text: "Personal Details" },
      ],
      expectedValue: "badger",
    });
    const buttons = wrapper.find("button");
    expect(buttons.length).to.equal(3);
    expect(buttons.at(0).text()).to.equal("Save");
    expect(buttons.at(1).text()).to.equal("Duplicate");
    expect(buttons.at(2).text()).to.equal("Delete");
  });

  test("Renders a form with the appropriate initial inputs when no section or controller selected", () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const wrapper = shallow(
      <PageEdit data={data} page={data.pages[0]} />
    ).dive();

    assertSelectInput({
      wrapper: wrapper.find("#page-type"),
      id: "page-type",
      expectedFieldOptions: [
        { value: "", text: "Question page" },
        { value: "./pages/start.js", text: "Start page" },
        { value: "./pages/summary.js", text: "Summary page" },
      ],
      expectedValue: "",
    });

    assertInputControlValue({
      wrapper,
      id: "page-title",
      expectedValue: "My first page",
    });

    assertInputControlValue({
      wrapper,
      id: "page-path",
      expectedValue: "/1",
    });

    assertSelectInput({
      wrapper: wrapper.find("#page-section"),
      id: "page-section",
      expectedFieldOptions: [
        { text: "" },
        { value: "badger", text: "Badger" },
        { value: "personalDetails", text: "Personal Details" },
      ],
      expectedValue: undefined,
    });
    const buttons = wrapper.find("button");
    expect(buttons.length).to.equal(3);
    expect(buttons.at(0).text()).to.equal("Save");
    expect(buttons.at(1).text()).to.equal("Duplicate");
    expect(buttons.at(2).text()).to.equal("Delete");
  });

  test("Updating the title changes the path if the path is the auto-generated one", () => {
    const data = new Data({
      pages: [{ path: "/my-first-page", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const wrapper = shallow(
      <PageEdit data={data} page={data.pages[0]} />
    ).dive();

    wrapper
      .find(Input)
      .filter("#page-title")
      .simulate("change", { target: { value: "New Page" } });

    assertInputControlValue({
      wrapper,
      id: "page-title",
      expectedValue: "New Page",
    });

    assertInputControlValue({
      wrapper,
      id: "page-path",
      expectedValue: "/new-page",
    });
  });

  test("Updating the title changes the path if the path is the auto-generated one for no title", () => {
    const data = new Data({
      pages: [{ path: "/", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const wrapper = shallow(
      <PageEdit data={data} page={data.pages[0]} />
    ).dive();

    wrapper
      .find(Input)
      .filter("#page-title")
      .simulate("change", { target: { value: "New Page" } });

    assertInputControlValue({
      wrapper,
      id: "page-title",
      expectedValue: "New Page",
    });

    assertInputControlValue({
      wrapper,
      id: "page-path",
      expectedValue: "/new-page",
    });
  });

  test.skip("Updating the title does not change the path if the path is not the auto-generated one", () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const wrapper = mount(<PageEdit data={data} page={data.pages[0]} />);
    wrapper
      .find("#page-title")
      .simulate("change", { target: { value: "New Page" } });

    assertTextInput({
      wrapper: wrapper.find("#page-title"),
      id: "page-title",
      expectedValue: "New Page",
    });

    assertTextInput({
      wrapper: wrapper.find("#page-path"),
      id: "page-path",
      expectedValue: "/1",
    });
  });

  test("Changing the section causes the new section to be selected", () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const wrapper = shallow(
      <PageEdit data={data} page={data.pages[0]} />
    ).dive();

    wrapper
      .find("#page-section")
      .simulate("change", { target: { value: "badger" } });

    assertSelectInput({
      wrapper: wrapper.find("#page-section"),
      id: "page-section",
      expectedFieldOptions: [
        { text: "" },
        { value: "badger", text: "Badger" },
        { value: "personalDetails", text: "Personal Details" },
      ],
      expectedValue: "badger",
    });
  });

  test("Changing the controller causes the new controller to be selected", () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const wrapper = shallow(
      <PageEdit data={data} page={data.pages[0]} />
    ).dive();

    wrapper
      .find("#page-type")
      .simulate("change", { target: { value: "./pages/summary.js" } });

    assertSelectInput({
      wrapper: wrapper.find("#page-type"),
      id: "page-type",
      expectedFieldOptions: [
        { value: "", text: "Question page" },
        { value: "./pages/start.js", text: "Start page" },
        { value: "./pages/summary.js", text: "Summary page" },
      ],
      expectedValue: "./pages/summary.js",
    });
  });

  test.skip("Duplicate page path will not submit", () => {
    const data = new Data({
      pages: [
        {
          path: "/first-page",
          title: "My first page",
          section: "badger",
          controller: "./pages/start.js",
        },
        {
          path: "/second-page",
          title: "My second page",
          section: "badger",
        },
      ],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const page = Object.assign(data.pages[0], { section: data.sections[0] });

    const wrapper = shallow(<PageEdit data={data} page={page} />).dive();

    wrapper
      .find(Input)
      .filter("#page-path")
      .simulate("change", { target: { value: "/second-page" } });

    const form = wrapper.find("form").first();
    form.simulate("submit", { preventDefault: sinon.spy() });
    wrapper.update();

    assertInputControlProp({
      wrapper,
      id: "page-path",
      expectedValue: { children: "Path '/second-page' already exists" },
      prop: "errorMessage",
    });
    expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
  });

  test.skip("Page title will have error if the value is removed", () => {
    const data = new Data({
      pages: [
        {
          path: "/1",
          title: "My first page",
          section: "badger",
          controller: "./pages/start.js",
        },
      ],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
        {
          name: "personalDetails",
          title: "Personal Details",
        },
      ],
    });

    const page = Object.assign(data.pages[0], { section: data.sections[0] });

    const wrapper = shallow(<PageEdit data={data} page={page} />).dive();

    let pageTitleInpt = wrapper.find(Input).filter("#page-title");
    pageTitleInpt.simulate("change", { target: { value: "" } });

    const form = wrapper.find("form").first();
    form.simulate("submit", { preventDefault: sinon.spy() });
    wrapper.update();
    assertInputControlProp({
      wrapper,
      id: "page-title",
      expectedValue: { children: ["Enter Title"] },
      prop: "errorMessage",
    });
    expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
  });
});
