import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import LinkCreate from "../client/link-create";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";
import { assertSelectInput, assertClasses } from "./helpers/element-assertions";
import { ErrorMessage } from "@govuk-jsx/error-message";
import ErrorSummary from "../client/error-summary";
import { DataContext } from "../client/context";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, describe } = lab;

suite("Link create", () => {
  const data = new Data({
    pages: [
      { path: "/1", title: "Page 1" },
      { path: "/2", title: "Page 2" },
    ],
    conditions: [
      { name: "someCondition", displayName: "My condition" },
      { name: "anotherCondition", displayName: "Another condition" },
    ],
  });

  let saveSpy = sinon.spy();
  const dataValue = { data, save: sinon.spy() };

  const DataWrapper = ({ dataValue = { data, save: saveSpy }, children }) => {
    return (
      <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>
    );
  };

  test("Renders a form with from and to inputs", () => {
    const wrapper = shallow(<LinkCreate data={data} />);
    const form = wrapper.find("form");

    assertSelectInput({
      wrapper: form.find("#link-source"),
      id: "link-source",
      expectedFieldOptions: [
        { text: "" },
        { value: "/1", text: "Page 1" },
        { value: "/2", text: "Page 2" },
      ],
    });

    assertSelectInput({
      wrapper: form.find("#link-target"),
      id: "link-target",
      expectedFieldOptions: [
        { text: "" },
        { value: "/1", text: "Page 1" },
        { value: "/2", text: "Page 2" },
      ],
    });

    expect(wrapper.find("SelectConditions").exists()).to.equal(false);
  });

  test("Selecting a from value causes the SelectConditions component to be displayed", async () => {
    const wrapper = shallow(<LinkCreate data={data} />);
    const form = wrapper.find("form");

    await form
      .find("#link-source")
      .simulate("change", { target: { value: "/1" } });
    const SelectConditions = wrapper.find("SelectConditions");
    expect(SelectConditions.exists()).to.equal(true);
    expect(SelectConditions.prop("data")).to.equal(data);
    expect(SelectConditions.prop("path")).to.equal("/1");
    expect(SelectConditions.prop("conditionsChange")).to.equal(
      wrapper.instance().conditionSelected
    );
  });

  describe("submitting the form", () => {
    test("with a condition creates a link and calls back", async (flags) => {
      const clonedData = {
        addLink: sinon.stub(),
      };
      const updatedData = sinon.spy();
      const savedData = sinon.spy();
      const onCreate = (data) => {
        expect(data.data).to.equal(savedData);
      };
      const save = (data) => {
        expect(data).to.equal(updatedData);
        return Promise.resolve(savedData);
      };
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapper = mount(
        <LinkCreate data={data} onCreate={wrappedOnCreate} />,
        {
          wrappingComponent: DataWrapper,
          wrappingComponentProps: { dataValue: { data, save } },
        }
      );
      const form = wrapper.find("form");
      form.find("#link-source").simulate("change", { target: { value: "/1" } });
      form.find("#link-target").simulate("change", { target: { value: "/2" } });
      const selectedCondition = "aCondition";
      wrapper.instance().conditionSelected(selectedCondition);

      const preventDefault = sinon.spy();

      data.clone = sinon.stub();
      data.clone.returns(clonedData);

      clonedData.addLink.returns(updatedData);

      await form.simulate("submit", { preventDefault: preventDefault });

      expect(preventDefault.calledOnce).to.equal(true);

      expect(clonedData.addLink.calledOnce).to.equal(true);
      expect(clonedData.addLink.firstCall.args[0]).to.equal("/1");
      expect(clonedData.addLink.firstCall.args[1]).to.equal("/2");
      expect(clonedData.addLink.firstCall.args[2]).to.equal(selectedCondition);
    });

    test("with no condition creates a link and calls back", async (flags) => {
      const clonedData = {
        addLink: sinon.stub(),
      };
      const updatedData = sinon.spy();
      const savedData = sinon.spy();
      const onCreate = (data) => {
        expect(data.data).to.equal(savedData);
      };
      const save = (data) => {
        expect(data).to.equal(updatedData);
        return Promise.resolve(savedData);
      };
      const wrappedOnCreate = flags.mustCall(onCreate, 1);

      const wrapper = mount(
        <LinkCreate data={data} onCreate={wrappedOnCreate} />,
        {
          wrappingComponent: DataWrapper,
          wrappingComponentProps: { dataValue: { data, save } },
        }
      );
      const form = wrapper.find("form");
      await form
        .find("#link-source")
        .simulate("change", { target: { value: "/1" } });
      await form
        .find("#link-target")
        .simulate("change", { target: { value: "/2" } });

      const preventDefault = sinon.spy();

      data.clone = sinon.stub();
      data.clone.returns(clonedData);

      clonedData.addLink.returns(updatedData);

      await form.simulate("submit", { preventDefault: preventDefault });

      expect(preventDefault.calledOnce).to.equal(true);

      expect(clonedData.addLink.calledOnce).to.equal(true);
      expect(clonedData.addLink.firstCall.args[0]).to.equal("/1");
      expect(clonedData.addLink.firstCall.args[1]).to.equal("/2");
      expect(clonedData.addLink.firstCall.args[2]).to.equal(undefined);
    });
  });

  test("with no from and to should not call callback function", async (flags) => {
    const wrappedOnCreate = sinon.spy();

    const wrapper = mount(
      <LinkCreate data={data} onCreate={wrappedOnCreate} />
    );

    const form = wrapper.find("form").first();
    await form.simulate("submit", { preventDefault: sinon.spy() });
    wrapper.update();

    const errorSummary = wrapper.find(ErrorSummary);
    expect(wrappedOnCreate.notCalled).to.equal(true);
    expect(errorSummary).to.exist();
    expect(errorSummary.props().errorList.length).to.be.equal(2);

    assertClasses(wrapper.find("#link-source"), [
      "govuk-select",
      "govuk-input--error",
    ]);
    assertClasses(wrapper.find("#link-source").parent(), [
      "govuk-form-group",
      "govuk-form-group--error",
    ]);
    expect(
      wrapper.find(".govuk-error-message").at(0).childAt(1).text()
    ).to.equal("Enter from");

    assertClasses(wrapper.find("#link-target"), [
      "govuk-select",
      "govuk-input--error",
    ]);
    assertClasses(wrapper.find("#link-target").parent(), [
      "govuk-form-group",
      "govuk-form-group--error",
    ]);
    expect(
      wrapper.find(".govuk-error-message").at(1).childAt(1).text()
    ).to.equal("Enter to");
  });
});
