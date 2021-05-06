import React from "react";
import { mount, shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import PageEdit from "../client/page-edit";
import { ErrorSummary } from "../client/error-summary";
import { assertSelectInput } from "./helpers/element-assertions";
import {
  assertInputControlValue,
  assertInputControlProp,
} from "./helpers/sub-component-assertions";
import { Input } from "@govuk-jsx/input";
import { initI18n } from "../client/i18n";
import { DataContext } from "../client/context";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, before } = lab;

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
  });

  test("Renders a form with the appropriate initial inputs", () => {
    const data = {
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
    };

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

  test("Renders a form with the appropriate initial inputs when no section or controller selected", () => {
    const data = {
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
    };

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
    const data = {
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
    };

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

  test("Changing the section causes the new section to be selected", () => {
    const data = {
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
    };

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

  test("Changing the controller causes the new controller to be selected", () => {
    const data = {
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
    };

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
});
