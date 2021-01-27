import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { NewConfig } from "../NewConfig";
import {
  stubFetchJson,
  restoreWindowMethods,
} from "../../../../test/helpers/window-stubbing";
import * as formConfigurationsApi from "../../../load-form-configurations";
import { initI18n } from "../../../i18n";
import { Input } from "@govuk-jsx/input";
import { assertInputControlProp } from "../../../../test/helpers/sub-component-assertions";
import ErrorSummary from "../../../error-summary";

initI18n();
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, afterEach } = lab;

const configurations = [
  {
    Key: "form-config-111.json",
    DisplayName: "Form Config 111",
    LastModified: "2020-08-03T14:39:45.000Z",
  },
  {
    Key: "form-config-222.json",
    DisplayName: "Form Config 222",
    LastModified: "2020-08-03T14:18:50.000Z",
  },
  {
    Key: "form-config-333.json",
    DisplayName: "Form Config 333",
    LastModified: "2020-08-03T14:20:48.000Z",
  },
];

const wait = () => new Promise((resolve) => setTimeout(resolve));

suite("New configuration screen", () => {
  let formConfigurationApiStub;
  const push = sinon.stub();
  const history = { push: push };

  afterEach(() => {
    sinon.restore();
  });

  test("new configuration is submitted correctly", async () => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves(configurations);
    stubFetchJson(200, { url: "configUrl" });

    const wrapper = shallow(<NewConfig history={history} />);
    await wait();

    wrapper.find(Input).simulate("change", {
      target: { value: "Test Configuration" },
      preventDefault: sinon.stub(),
    });

    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    // @ts-ignore
    expect(window.fetch.getCall(0).args[1].body).to.equal(
      '{"selected":{"Key":"New"},"name":"test-configuration"}'
    );

    restoreWindowMethods();
  });

  test("it will not submit when alreadyExistsError", async () => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves([
        {
          Key: "visa-form",
          DisplayName: "Visa Form",
        },
      ]);
    stubFetchJson(200, { url: "configUrl" });

    const wrapper = shallow(<NewConfig history={history} />);
    await wait();

    wrapper.find(Input).simulate("change", {
      target: { value: "Visa Form" },
      preventDefault: sinon.stub(),
    });

    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    // @ts-ignore
    expect(window.fetch.called).to.equal(false);
    restoreWindowMethods();
  });

  test("already existing error is shown correctly", async () => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves([
        {
          Key: "visa-form",
          DisplayName: "Visa Form",
        },
      ]);

    const wrapper = shallow(<NewConfig history={history} />);
    await wait();

    wrapper.find(Input).simulate("change", {
      target: { value: "Visa Form" },
      preventDefault: sinon.stub(),
    });
    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    assertInputControlProp({
      wrapper,
      id: "formName",
      expectedValue: { children: "A form with this name already exists" },
      prop: "errorMessage",
    });
    expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
  });

  test("Enter form name error shown correctly", async () => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves(configurations);

    const wrapper = shallow(<NewConfig history={history} />);
    await wait();

    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    assertInputControlProp({
      wrapper,
      id: "formName",
      expectedValue: { children: "Enter form name" },
      prop: "errorMessage",
    });
    expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
  });

  test("Form name with special characters results in error", async () => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves(configurations);

    const wrapper = shallow(<NewConfig history={history} />);
    await wait();

    wrapper.find(Input).simulate("change", {
      target: { value: "Visa & Form" },
      preventDefault: sinon.stub(),
    });

    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    assertInputControlProp({
      wrapper,
      id: "formName",
      expectedValue: {
        children: "Form name should not contain special characters",
      },
      prop: "errorMessage",
    });
    expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
  });
});
