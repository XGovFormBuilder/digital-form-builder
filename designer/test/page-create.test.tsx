import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import PageCreate from "../client/page-create";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";
import {
  assertTextInput,
  assertSelectInput,
  assertClasses,
} from "./helpers/element-assertions";
import initI18n from "./i18nForTest";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, describe, before } = lab;

suite("Page create", () => {
  const data = new Data({
    pages: [{ path: "/1" }, { path: "/2" }],
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

  before(() => {
    initI18n();
  });

  test("Renders a form with the appropriate initial inputs", () => {
    const wrapper = mount(<PageCreate data={data} />);

    assertSelectInput({
      wrapper: wrapper.find("#page-type"),
      id: "page-type",
      expectedFieldOptions: [
        { value: "", text: "Question Page" },
        { value: "./pages/start.js", text: "Start Page" },
        { value: "./pages/summary.js", text: "Summary Page" },
      ],
    });

    assertTextInput({
      wrapper: wrapper.find("#page-title"),
      id: "page-title",
      expectedValue: "",
    });

    assertTextInput({
      wrapper: wrapper.find("#page-path"),
      id: "page-path",
      expectedValue: "/",
    });

    assertSelectInput({
      wrapper: wrapper.find("#link-from"),
      id: "link-from",
      expectedFieldOptions: [
        { text: "" },
        { value: "/1", text: "/1" },
        { value: "/2", text: "/2" },
      ],
    });

    assertSelectInput({
      wrapper: wrapper.find("#page-section"),
      id: "page-section",
      expectedFieldOptions: [
        { text: "" },
        { value: "badger", text: "Badger" },
        { value: "personalDetails", text: "Personal Details" },
      ],
    });

    expect(wrapper.find("SelectConditions").exists()).to.equal(false);
  });

  test("Inputs remain populated when amending other fields", () => {
    const wrapper = mount(<PageCreate data={data} />);
    wrapper
      .find("#page-type")
      .simulate("change", { target: { value: "./pages/start.js" } });
    wrapper
      .find("#page-title")
      .simulate("change", { target: { value: "New Page" } });
    wrapper.find("#link-from").simulate("change", { target: { value: "/2" } });
    wrapper
      .find("#page-section")
      .simulate("change", { target: { value: "personalDetails" } });

    assertTextInput({
      wrapper: wrapper.find("#page-title"),
      id: "page-title",
      expectedValue: "New Page",
    });

    assertSelectInput({
      wrapper: wrapper.find("#link-from"),
      id: "link-from",
      expectedFieldOptions: [
        { text: "" },
        { value: "/1", text: "/1" },
        { value: "/2", text: "/2" },
      ],
      expectedValue: "/2",
    });

    assertSelectInput({
      wrapper: wrapper.find("#page-section"),
      id: "page-section",
      expectedFieldOptions: [
        { text: "" },
        { value: "badger", text: "Badger" },
        { value: "personalDetails", text: "Personal Details" },
      ],
      expectedValue: "personalDetails",
    });

    assertSelectInput({
      wrapper: wrapper.find("#page-type"),
      id: "page-type",
      expectedFieldOptions: [
        { value: "", text: "Question Page" },
        { value: "./pages/start.js", text: "Start Page" },
        { value: "./pages/summary.js", text: "Summary Page" },
      ],
      expectedValue: "./pages/start.js",
    });

    expect(wrapper.find("SelectConditions").exists()).to.equal(true);
  });

  test("Selecting a link from displays the conditions section", () => {
    const wrapper = mount(<PageCreate data={data} />);
    wrapper.find("#link-from").simulate("change", { target: { value: "/2" } });

    const SelectConditions = wrapper.find("SelectConditions");
    expect(SelectConditions.exists()).to.equal(true);
    expect(SelectConditions.prop("data")).to.equal(data);
    expect(SelectConditions.prop("path")).to.equal("/2");
  });

  test("Page title will have error if the value is removed", () => {
    const wrapper = mount(<PageCreate data={data} />);

    wrapper.find("#page-title").simulate("change", { target: { value: "" } });

    const form = wrapper.find("form").first();
    form.simulate("submit");

    assertClasses(wrapper.find("#page-title"), [
      "govuk-input",
      "govuk-input--error",
    ]);

    assertClasses(wrapper.find("#page-title").parent(), [
      "govuk-form-group",
      "govuk-form-group--error",
    ]);

    expect(wrapper.find("span.govuk-error-message")).to.exist();
  });

  describe("Submitting the form", () => {
    test("with a selected condition creates a page and calls back", async (flags) => {
      const expectedPage = {
        path: "/new-page",
        title: "New Page",
        section: "personalDetails",
        controller: "./pages/start.js",
        next: [],
        components: [],
      };
      const onCreate = (data) => {
        expect(data.value).to.equal(expectedPage);
      };
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub(),
      };
      data.save = sinon.stub();
      data.save.resolves(clonedData);
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );

      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      wrapper
        .find("#page-type")
        .simulate("change", { target: { value: "./pages/start.js" } });
      wrapper
        .find("#page-title")
        .simulate("change", { target: { value: "New Page" } });
      wrapper
        .find("#link-from")
        .simulate("change", { target: { value: "/2" } });
      wrapper
        .find("#page-section")
        .simulate("change", { target: { value: "personalDetails" } });

      const selectedCondition = "condition1";
      wrapper.instance().conditionSelected(selectedCondition);

      data.clone = sinon.stub();
      data.clone.returns(clonedData);
      clonedData.addLink.returns(clonedData);
      clonedData.addPage.returns(clonedData);

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });

      expect(preventDefault.calledOnce).to.equal(true);

      expect(clonedData.addLink.calledOnce).to.equal(true);
      expect(clonedData.addLink.firstCall.args[0]).to.equal("/2");
      expect(clonedData.addLink.firstCall.args[1]).to.equal("/new-page");
      expect(clonedData.addLink.firstCall.args[2]).to.equal(selectedCondition);
      expect(clonedData.addPage.calledOnce).to.equal(true);
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage);
    });

    test("with no condition creates a page and calls back", async (flags) => {
      const expectedPage = {
        path: "/new-page",
        title: "New Page",
        section: "personalDetails",
        controller: "./pages/start.js",
        next: [],
        components: [],
      };
      const onCreate = (data) => {
        expect(data.value).to.equal(expectedPage);
      };
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub(),
      };

      data.save = sinon.stub();
      data.save.resolves(clonedData);
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );

      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      wrapper
        .find("#page-type")
        .simulate("change", { target: { value: "./pages/start.js" } });
      wrapper
        .find("#page-title")
        .simulate("change", { target: { value: "New Page" } });
      wrapper
        .find("#link-from")
        .simulate("change", { target: { value: "/2" } });
      wrapper
        .find("#page-section")
        .simulate("change", { target: { value: "personalDetails" } });

      data.clone = sinon.stub();
      data.clone.returns(clonedData);
      clonedData.addLink.returns(clonedData);
      clonedData.addPage.returns(clonedData);

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });

      expect(preventDefault.calledOnce).to.equal(true);

      expect(clonedData.addLink.calledOnce).to.equal(true);
      expect(clonedData.addLink.firstCall.args[0]).to.equal("/2");
      expect(clonedData.addLink.firstCall.args[1]).to.equal("/new-page");
      expect(clonedData.addLink.firstCall.args[2]).to.equal(undefined);
      expect(clonedData.addPage.calledOnce).to.equal(true);
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage);
    });

    test("with no link from or section creates a page and calls back", async (flags) => {
      const expectedPage = {
        path: "/new-page",
        title: "New Page",
        controller: "./pages/start.js",
        next: [],
        components: [],
      };
      const onCreate = (data) => {
        expect(data.value).to.equal(expectedPage);
      };
      const clonedData = {
        addPage: sinon.stub(),
      };

      data.save = sinon.stub();
      data.save.resolves(clonedData);
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );

      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      wrapper
        .find("#page-type")
        .simulate("change", { target: { value: "./pages/start.js" } });
      wrapper
        .find("#page-title")
        .simulate("change", { target: { value: "New Page" } });

      data.clone = sinon.stub();
      data.clone.returns(clonedData);
      clonedData.addPage.returns(clonedData);

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });

      expect(preventDefault.calledOnce).to.equal(true);
      expect(clonedData.addPage.calledOnce).to.equal(true);
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage);
    });

    test("translated title to path automatically if no path provided", async (flags) => {
      const expectedPage = {
        path: "/my-new-page-23",
        title: "My New    Page 23?!¢#",
        controller: "./pages/start.js",
        next: [],
        components: [],
      };
      const onCreate = (data) => {
        expect(data.value).to.equal(expectedPage);
      };
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub(),
      };
      data.save = sinon.stub();
      data.save.resolves(clonedData);
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );

      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      wrapper
        .find("#page-type")
        .simulate("change", { target: { value: "./pages/start.js" } });
      wrapper
        .find("#page-title")
        .simulate("change", { target: { value: "My New    Page 23?!¢#" } });

      data.clone = sinon.stub();
      data.clone.returns(clonedData);
      clonedData.addLink.returns(clonedData);
      clonedData.addPage.returns(clonedData);

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });
      expect(clonedData.addPage.calledOnce).to.equal(true);
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage);
    });
    test("Whitespace in paths is replaced with hyphens", async (flags) => {
      const expectedPage = {
        path: "/my-new-page-23",
        title: "My New    Page 23?!¢#",
        controller: "./pages/start.js",
        next: [],
        components: [],
      };
      const onCreate = (data) => {
        expect(data.value).to.equal(expectedPage);
      };
      const clonedData = {
        addPage: sinon.stub(),
        addLink: sinon.stub(),
      };
      data.save = sinon.stub();
      data.save.resolves(clonedData);
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );
      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      wrapper
        .find("#page-type")
        .simulate("change", { target: { value: "./pages/start.js" } });
      wrapper
        .find("#page-path")
        .simulate("change", { target: { value: "dancing  badger s" } });
      wrapper
        .find("#page-title")
        .simulate("change", { target: { value: "My New    Page 23?!¢#" } });

      data.clone = sinon.stub();
      data.clone.returns(clonedData);
      clonedData.addLink.returns(clonedData);
      clonedData.addPage.returns(clonedData);

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });
      expect(clonedData.addPage.calledOnce).to.equal(true);
      expect(clonedData.addPage.firstCall.args[0]).to.equal(expectedPage);
    });

    test("Whitespace in page title will not submit form", async (flags) => {
      const wrappedOnCreate = sinon.spy();

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );
      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      //wrapper.find("#page-type").simulate("change", { target: { value: "" } });

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });
      expect(wrappedOnCreate.notCalled).to.equal(true);
    });

    test("Duplicate page path will not submit form", async (flags) => {
      const wrappedOnCreate = sinon.spy();

      const wrapperWithi18n = mount(
        <PageCreate data={data} onCreate={wrappedOnCreate} />
      );
      const wrapper = wrapperWithi18n.childAt(0);

      const preventDefault = sinon.spy();
      wrapper
        .find("#page-title")
        .simulate("change", { target: { value: "My New    Page 23?!¢#" } });

      wrapper
        .find("#page-path")
        .simulate("change", { target: { value: "/1" } });

      await wrapper.instance().onSubmit({ preventDefault: preventDefault });
      expect(wrappedOnCreate.notCalled).to.equal(true);
    });
  });
});
