import React from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data, FormConfiguration } from "@xgovformbuilder/model";
import { ErrorSummary } from "../client/error-summary";

import sinon from "sinon";
import * as formConfigurationsApi from "../client/load-form-configurations";

import { assertInputControlProp } from "./helpers/sub-component-assertions";
import { DataContext } from "../client/context";
const formConfigurations = [
  new FormConfiguration("someKey", "Some display name", undefined, true),
  new FormConfiguration("anotherKey", "Another display name", undefined, true),
  new FormConfiguration("thirdKey", undefined, undefined, true),
  new FormConfiguration(
    "nonFeedbackFormShouldBeIgnored",
    undefined,
    undefined,
    false
  ),
];

import FormDetails from "../client/form-details";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, beforeEach, describe, suite, test, before, after } = lab;

suite("Form details", () => {
  let save = sinon.spy();
  let data;
  let loadStub;
  let fetchStub;

  beforeEach(() => {
    save.resetHistory();
    loadStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves(formConfigurations);

    fetchStub = sinon
      .stub(formConfigurationsApi, "fetchConfigurations")
      .resolves(formConfigurations);
  });

  afterEach(() => {
    loadStub.restore();
    fetchStub.restore();
  });

  after(() => {
    sinon.restore();
  });

  const DataWrapper = ({ dataValue = { data, save }, children }) => {
    return (
      <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>
    );
  };

  describe("rendering", () => {
    let data;
    let save;

    before(() => {
      data = new Data({});
      save = sinon.spy();
    });

    afterEach(() => {
      data.feedbackForm = false;
      data.name = undefined;
    });

    test.skip("Renders a form with the appropriate initial inputs", () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: { dataValue: { data, save } },
      });
      const radios = wrapper.find("Radios");

      assertInputControlProp({
        wrapper,
        id: "form-title",
        prop: "defaultValue",
        expectedValue: "",
      });
      expect(radios.props()).to.equal({
        name: "feedbackForm",
        value: false,
        onChange: wrapper.instance().handleIsFeedbackFormRadio,
        required: true,
        fieldset: {
          legend: {
            children: ["Is this a feedback form?"],
          },
        },
        hint: {
          children: [
            "A feedback form is used to gather feedback from users about another form",
          ],
        },
        items: [
          {
            children: ["Yes"],
            value: true,
          },
          {
            children: ["No"],
            value: false,
          },
        ],
      });
      expect(wrapper.find(ErrorSummary).exists()).to.equal(false);
    });

    test("Renders pre-populated name input when form already has a name", () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data: { name: "My form" }, save },
        },
      });
      expect(wrapper.find("#form-title").first().props().defaultValue).to.equal(
        "My form"
      );
    });

    test("Renders Feedback form 'yes' checked when form is a feedback form", () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data: { feedbackForm: true }, save },
        },
      });
      const radios = wrapper.find("Radios");
      expect(radios.prop("value")).to.equal(true);
    });

    test("Renders Feedback 'no' checked when form is not a feedback form", () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: { dataValue: { data, save } },
      });
      const radios = wrapper.find("Radios");
      expect(radios.prop("value")).to.equal(false);
    });

    test("handleIsFeedbackFormRadio should update state values correctly", () => {
      const wrapper = mount(<FormDetails />).instance();
      var spy = sinon.spy(wrapper, "setState");

      wrapper.handleIsFeedbackFormRadio({ target: { value: "true" } });
      expect(
        spy.calledWith({ feedbackForm: true, selectedFeedbackForm: undefined })
      ).to.equal(true);

      spy.resetHistory();
      wrapper.handleIsFeedbackFormRadio({ target: { value: "false" } });
      expect(spy.calledWith({ feedbackForm: false })).to.equal(true);
    });

    test("Renders Feedback form input when form is not a feedback form", async () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: { dataValue: { data, save } },
      });

      const expectedFieldOptions = [
        { value: "someKey", text: "Some display name" },
        { value: "anotherKey", text: "Another display name" },
        { value: "thirdKey", text: "thirdKey" },
      ];

      wrapper.setState({
        formConfigurations: formConfigurations.filter((it) => it.feedbackForm),
      });
      wrapper.update();
      expect(
        wrapper.find("#target-feedback-form option").map((c) => {
          return {
            text: c.text(),
            value: c.props().value,
          };
        })
      ).to.contain(expectedFieldOptions);

      expect(wrapper.find("#target-feedback-form-hint").exists()).to.equal(
        true
      );
      expect(
        wrapper
          .find("#target-feedback-form-hint")
          .text()
          .startsWith(
            "This is the form to use for gathering feedback about this form"
          )
      ).to.equal(true);
    });

    test("Renders no configurations found text when no form configurations are located", () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: { dataValue: { data, save } },
      });
      expect(wrapper.find("#target-feedback-form-hint").exists()).to.equal(
        true
      );
      expect(
        wrapper
          .find("#target-feedback-form-hint")
          .text()
          .startsWith("No available feedback form configurations found")
      ).to.equal(true);
      expect(wrapper.find("#target-feedback-form").exists()).to.equal(false);
    });

    test("Does not render Feedback url input when form is a feedback form", () => {
      data.feedbackForm = true;
      const wrapper = mount(<FormDetails />, {
        wrappingComponentProps: {
          wrappingComponent: DataWrapper,
          dataValue: { data: { feedbackForm: true }, save },
        },
      });
      expect(wrapper.find("#feedback-url").exists()).to.equal(false);
    });

    test("Renders populated target feedback form input when present and form is not a feedback form", async () => {
      data.setFeedbackUrl("/anotherKey");

      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data: { feedbackUrl: "/anotherKey" }, save },
        },
      });
      const expectedFieldOptions = [
        { text: "" },
        { value: "someKey", text: "Some display name" },
        { value: "anotherKey", text: "Another display name" },
        { value: "thirdKey", text: "thirdKey" },
      ];
      wrapper.setState({
        formConfigurations: formConfigurations.filter((it) => it.feedbackForm),
      });

      expect(wrapper.find("#target-feedback-form").props().value).to.equal(
        "anotherKey"
      );

      expect(wrapper.find("#target-feedback-form-hint").exists()).to.equal(
        true
      );
      expect(
        wrapper
          .find("#target-feedback-form-hint")
          .text()
          .startsWith(
            "This is the form to use for gathering feedback about this form"
          )
      ).to.equal(true);
    });
  });

  describe("on submit", () => {
    beforeEach(() => {
      data = new Data({});
      data.name = "My New Form";
      data.clone = sinon.stub().returns(data);
    });

    test("required error when title is not set", async () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data: { name: undefined }, save },
        },
      });
      expect(save.callCount).to.equal(0);
      await wrapper.find("form").invoke("onSubmit")();
      expect(wrapper.find("ErrorMessage").text()).to.equal(
        "Error: Enter Title"
      );
    });

    test("name should be set correctly when unchanged", async () => {
      const clone = () => ({ name: "My form", setFeedbackUrl: sinon.spy() });
      const data = { name: "My form", setFeedbackUrl: sinon.spy(), clone };

      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: {
            data,
            save,
          },
        },
      });
      await wrapper.find("form").invoke("onSubmit")();
      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].name).to.equal("My form");
    });

    test("name should be set correctly when changed", async () => {
      const clone = () => ({ name: "New name", setFeedbackUrl: sinon.spy() });
      const data = { name: "My form", setFeedbackUrl: sinon.spy(), clone };
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: {
            data,
            save,
          },
        },
      });
      wrapper.setState({ title: "New name" });
      wrapper.update();

      await wrapper.find("form").invoke("onSubmit")();

      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].name).to.equal("New name");
    });

    test("feedbackForm should be set correctly when unchanged", async () => {
      const clone = () => ({
        name: "name",
        feedbackForm: true,
        setFeedbackUrl: sinon.spy(),
      });
      const data = { name: "name", feedbackForm: true, clone };
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data, save },
        },
      });
      await wrapper.find("form").invoke("onSubmit")();

      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].feedbackForm).to.equal(true);
    });

    test.skip("feedbackForm should be set correctly when changed to true", async () => {
      const clone = () => ({ setFeedbackUrl: sinon.spy() });
      const data = { clone };
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: { dataValue: { data, save } },
      });
      wrapper.find("Radios").first().prop("onChange")({
        target: { value: true },
      });
      await wrapper.find("form").invoke("onSubmit")();

      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].feedbackForm).to.equal(true);
    });

    test.skip("feedbackForm should be set correctly when changed to false", async () => {
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data: { feedbackForm: true }, save },
        },
      });
      wrapper.find("Radios").first().prop("onChange")({
        target: { value: false },
      });
      await wrapper.find("form").invoke("onSubmit")();

      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].feedbackForm).to.equal(false);
    });

    test.skip("Feedback url should be cleared when changing to a feedback form", async () => {
      const clone = () => ({
        feedbackUrl: "/feedback",
        setFeedbackUrl: sinon.spy(),
      });
      const data = { feedbackUrl: "/feedback", clone };
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data, save },
        },
      });
      wrapper.find("Radios").first().prop("onChange")({
        target: { value: true },
      });
      await wrapper.instance().onSubmit();

      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].feedbackUrl).to.equal(undefined);
    });

    test("feedbackUrl should be set correctly when unchanged", async () => {
      const clone = () => ({
        name: "my form",
        feedbackUrl: "/feedback",
        setFeedbackUrl: sinon.spy(),
      });
      const data = { name: "my form", feedbackUrl: "/feedback", clone };
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data, save },
        },
      });
      await wrapper.find("form").invoke("onSubmit")();

      expect(save.callCount).to.equal(1);
      expect(save.firstCall.args[0].feedbackUrl).to.equal("/feedback");
    });

    test("feedbackUrl should be set correctly when changed", async () => {
      const clone = () => ({
        name: "my form",
        feedbackUrl: "/anotherKey",
        setFeedbackUrl: sinon.spy(),
      });
      const data = { name: "my form", feedbackUrl: "/feedback", clone };
      const wrapper = mount(<FormDetails />, {
        wrappingComponent: DataWrapper,
        wrappingComponentProps: {
          dataValue: { data, save },
        },
      });
      wrapper.setState({
        formConfigurations: formConfigurations.filter((it) => it.feedbackForm),
      });
      wrapper.update();

      wrapper
        .find("#target-feedback-form")
        .first()
        .simulate("change", { target: { value: "anotherKey" } });

      wrapper
        .find("form")
        .invoke("onSubmit")()
        .then(() => {
          expect(save.callCount).to.equal(1);
          expect(save.firstCall.args[0].feedbackUrl).to.equal("/anotherKey");
        });
    });
  });
});
