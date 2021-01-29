import React from "react";
import { mount, shallow } from "enzyme";
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
import { ToggleApi } from "../client/api/toggleApi";

import { DataContext } from "../client/context";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, before, after } = lab;

const DataWrapper = ({
  dataValue = { data: {}, save: sinon.spy() },
  children,
}) => {
  return (
    <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>
  );
};

suite("Page edit", () => {
  before(() => {
    initI18n();
    sinon.stub(ToggleApi.prototype, "fetchToggles").callsFake(function () {
      return { ff_featureDuplicatePage: "false" };
    });
  });

  after(() => {
    sinon.restore();
  });

  //TODO: update test for conditional button
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

    const wrapper = mount(<PageEdit page={data.pages[0]} />, {
      wrappingComponent: DataWrapper,
      wrappingComponentProps: { dataValue: { data, save: sinon.spy() } },
    });

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
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).text()).to.equal("Save");
    expect(buttons.at(1).text()).to.equal("Delete");
  });
  //TODO: update test for conditional button
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

    const wrapper = mount(<PageEdit page={data.pages[0]} />, {
      wrappingComponent: DataWrapper,
      wrappingComponentProps: { dataValue: { data, save: sinon.spy() } },
    });

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
      expectedValue: "",
    });
    const buttons = wrapper.find("button");
    expect(buttons.length).to.equal(2);
    expect(buttons.at(0).text()).to.equal("Save");
    expect(buttons.at(1).text()).to.equal("Delete");
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

    const wrapper = mount(<PageEdit page={data.pages[0]} />, {
      wrappingComponent: DataWrapper,
      wrappingComponentProps: { dataValue: { data, save: sinon.spy() } },
    });

    wrapper
      .find(Input)
      .filter("#page-title")
      .simulate("change", { target: { value: "New Page" } });

    assertInputControlValue({
      wrapper,
      id: "page-path",
      expectedValue: "/my-first-page",
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

    const wrapper = mount(<PageEdit page={data.pages[0]} />, {
      wrappingComponent: DataWrapper,
      wrappingComponentProps: { dataValue: { data, save: sinon.spy() } },
    });

    assertTextInput({
      wrapper: wrapper.find("#page-path"),
      id: "page-path",
      expectedValue: "/1",
    });
  });

  test("Changing the section causes the new section to be selected", (done) => {
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

    const wrapper = mount(<PageEdit page={data.pages[0]} />, {
      wrappingComponent: DataWrapper,
      wrappingComponentProps: { dataValue: { data, save: sinon.spy() } },
    });

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

  test("should show duplicate if feature toggle is set to true", () => {
    const data = new Data({
      pages: [{ path: "/1", title: "My first page" }],
      sections: [
        {
          name: "badger",
          title: "Badger",
        },
      ],
    });

    // let editComponent = mount(<PageEdit data={data} page={data.pages[0]} />);
    // const buttons = editComponent.find("button");
    // expect(buttons.length).to.equal(2);

    sinon.restore();
    sinon.stub(ToggleApi.prototype, "fetchToggles").callsFake(function () {
      return { ff_featureDuplicatePage: "true" };
    });

    let editComponent = mount(<PageEdit data={data} page={data.pages[0]} />);
    // editComponent.update();

    // editComponent.setProps({})

    setImmediate(() => {
      expect(editComponent.find("button").length).to.equal(3);
      // have to call `done` here to let Jest know the test is done
      done();
    });

    // expect(buttons.at(0).text()).to.equal("Save");
    // expect(await findAllByText("Duplicate")).toBeTruthy();
    // expect(buttons.at(2).text()).to.equal("Delete");
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

    const wrapper = mount(<PageEdit page={data.pages[0]} />, {
      wrappingComponent: DataWrapper,
      wrappingComponentProps: { dataValue: { data, save: sinon.spy() } },
    });

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

    const wrapper = mount(<PageEdit page={page} />);

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

    const wrapper = shallow(<PageEdit page={page} />).dive();

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
