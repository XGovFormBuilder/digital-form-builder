import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data, FormConfiguration } from "@xgovformbuilder/model";
import {
  assertSelectInput,
  assertTextInput,
  assertClasses,
} from "./helpers/element-assertions";
import FormDetails from "../client/form-details";
import { ErrorSummary } from "../client/error-summary";
import { Input } from "@govuk-jsx/input";

import sinon from "sinon";
import formConfigurationsApi from "../client/load-form-configurations";
import { assertInputControlProp } from "./helpers/sub-component-assertions";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { afterEach, beforeEach, describe, suite, test } = lab;

suite("Form details", () => {
  const formConfigurations = [
    new FormConfiguration("someKey", "Some display name", undefined, true),
    new FormConfiguration(
      "anotherKey",
      "Another display name",
      undefined,
      true
    ),
    new FormConfiguration("thirdKey", undefined, undefined, true),
    new FormConfiguration(
      "nonFeedbackFormShouldBeIgnored",
      undefined,
      undefined,
      false
    ),
  ];
  let formConfigurationApiStub;

  beforeEach(() => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves(formConfigurations);
  });

  afterEach(() => {
    formConfigurationApiStub.restore();
  });

  describe("rendering", () => {
    const data = new Data({});

    afterEach(() => {
      data.feedbackForm = false;
      data.name = undefined;
    });

    test.skip("Renders a form with the appropriate initial inputs", () => {
      const wrapper = shallow(<FormDetails data={data} />);
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
      data.name = "My form";
      const wrapper = shallow(<FormDetails data={data} />);
      assertTextInput({
        wrapper: wrapper.find(Input).dive().find("#form-title"),
        id: "form-title",
        expectedValue: "My form",
      });
    });

    test("Entered form name is displayed", () => {
      data.name = "My form";
      const wrapper = shallow(<FormDetails data={data} />);
      wrapper
        .find(Input)
        .dive()
        .find("#form-title")
        .simulate("change", { target: { value: "New name" } })
        .simulate("blur", { target: { value: "New name" } });
      assertTextInput({
        wrapper: wrapper.find(Input).dive().find("#form-title"),
        id: "form-title",
        expectedValue: "New name",
      });
    });

    test("Renders Feedback form 'yes' checked when form is a feedback form", () => {
      data.feedbackForm = true;
      const wrapper = shallow(<FormDetails data={data} />);
      const radios = wrapper.find("Radios");
      expect(radios.prop("value")).to.equal(true);
    });

    test("Renders Feedback 'no' checked when form is not a feedback form", () => {
      const wrapper = shallow(<FormDetails data={data} />);
      const radios = wrapper.find("Radios");
      expect(radios.prop("value")).to.equal(false);
    });

    test("handleIsFeedbackFormRadio should update state values correctly", () => {
      const wrapper = shallow(<FormDetails data={data} />).instance();
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
      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().componentDidMount();
      const expectedFieldOptions = [
        { text: "" },
        { value: "someKey", text: "Some display name" },
        { value: "anotherKey", text: "Another display name" },
        { value: "thirdKey", text: "thirdKey" },
      ];

      assertSelectInput({
        wrapper: wrapper.find("#target-feedback-form"),
        id: "target-feedback-form",
        expectedFieldOptions,
      });
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
      formConfigurationApiStub.restore();
      formConfigurationApiStub = sinon
        .stub(formConfigurationsApi, "loadConfigurations")
        .resolves([]);

      const wrapper = shallow(<FormDetails data={data} />);
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
      const wrapper = shallow(<FormDetails data={data} />);
      expect(wrapper.find("#feedback-url").exists()).to.equal(false);
    });

    test("Renders populated target feedback form input when present and form is not a feedback form", async () => {
      data.setFeedbackUrl("/anotherKey");
      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().componentDidMount();
      const expectedFieldOptions = [
        { text: "" },
        { value: "someKey", text: "Some display name" },
        { value: "anotherKey", text: "Another display name" },
        { value: "thirdKey", text: "thirdKey" },
      ];

      assertSelectInput({
        wrapper: wrapper.find("#target-feedback-form"),
        id: "target-feedback-form",
        expectedFieldOptions,
        expectedValue: "anotherKey",
      });
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
    let data;
    beforeEach(() => {
      data = new Data({});
      data.name = "My New Form";
      data.clone = sinon.stub().returns(data);
      data.save = sinon.stub().resolves(data);
    });

    test("required error when title is not set", async () => {
      data.name = undefined;
      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });
      wrapper.update();
      expect(data.save.callCount).to.equal(0);
      expect(wrapper.find(Input)).to.exist();
      assertClasses(wrapper.find(Input).dive().find("#form-title"), [
        "govuk-input",
        "govuk-input--error",
      ]);
      assertClasses(wrapper.find(Input).dive().find("div"), [
        "govuk-form-group",
        "govuk-form-group--error",
      ]);
      expect(
        wrapper.find(Input).dive().find("ErrorMessage").dive().childAt(1).text()
      ).to.equal("Enter title");
      expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
      const errorList: Array<any> = wrapper
        .find(ErrorSummary)
        .prop("errorList");
      expect(errorList.length).to.equal(1);
      expect(errorList[0]).to.contain({
        children: ["Enter title"],
        href: "#form-title",
      });
    });

    test("name should be set correctly when unchanged", async () => {
      data.name = "My form";
      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].name).to.equal("My form");
    });

    test("name should be set correctly when changed", async () => {
      data.name = "My form";
      const wrapper = shallow(<FormDetails data={data} />);
      wrapper
        .find("#form-title")
        .simulate("change", { target: { value: "New name" } })
        .simulate("blur", { target: { value: "New name" } });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].name).to.equal("New name");
    });

    test("name should be set correctly when changed", async () => {
      data.name = "My form";
      const wrapper = shallow(<FormDetails data={data} />);
      wrapper
        .find("#form-title")
        .simulate("change", { target: { value: "New name" } })
        .simulate("blur", { target: { value: "New name" } });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].name).to.equal("New name");
    });

    test("feedbackForm should be set correctly when unchanged", async () => {
      data.feedbackForm = true;
      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].feedbackForm).to.equal(true);
    });

    test.skip("feedbackForm should be set correctly when changed to true", async () => {
      const wrapper = shallow(<FormDetails data={data} />);
      wrapper.find("Radios").first().prop("onChange")({
        target: { value: true },
      });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].feedbackForm).to.equal(true);
    });

    test.skip("feedbackForm should be set correctly when changed to false", async () => {
      data.feedbackForm = true;
      const wrapper = shallow(<FormDetails data={data} />);
      wrapper.find("Radios").first().prop("onChange")({
        target: { value: false },
      });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].feedbackForm).to.equal(false);
    });

    test.skip("Feedback url should be cleared when changing to a feedback form", async () => {
      data.setFeedbackUrl("/feedback", true);
      const wrapper = shallow(<FormDetails data={data} />);
      wrapper.find("Radios").first().prop("onChange")({
        target: { value: true },
      });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].feedbackUrl).to.equal(undefined);
    });

    test("feedbackUrl should be set correctly when unchanged", async () => {
      data.setFeedbackUrl("/feedback");
      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].feedbackUrl).to.equal("/feedback");
    });

    test("feedbackUrl should be set correctly when changed", async () => {
      data.setFeedbackUrl("/someKey");

      const wrapper = shallow(<FormDetails data={data} />);
      await wrapper.instance().componentDidMount();
      wrapper
        .find("#target-feedback-form")
        .simulate("change", { target: { value: "anotherKey" } });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0].feedbackUrl).to.equal("/anotherKey");
    });

    test("Updated data should be saved correctly and saved data should be passed to callback", async () => {
      data.name = "My form";
      const clonedData = {
        setFeedbackUrl: sinon.spy(),
      };
      data.clone.returns(clonedData);
      const savedData = sinon.spy();
      data.save.resolves(savedData);

      const onCreate = sinon.spy();
      const wrapper = shallow(<FormDetails data={data} onCreate={onCreate} />);
      wrapper
        .find("#form-title")
        .simulate("change", { target: { value: "New name" } })
        .simulate("blur", { target: { value: "New name" } });
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() });

      expect(data.save.callCount).to.equal(1);
      expect(data.save.firstCall.args[0]).to.equal(clonedData);
      expect(clonedData.name).to.equal("New name");

      expect(onCreate.callCount).to.equal(1);
      expect(onCreate.firstCall.args[0]).to.equal(savedData);
    });
  });
});
