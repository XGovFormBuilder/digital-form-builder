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

    wrapper.find("input").simulate("change", {
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

    wrapper.find("input").simulate("change", {
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

    wrapper.find("input").simulate("change", {
      target: { value: "Visa Form" },
      preventDefault: sinon.stub(),
    });
    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    const summaryErrorList = wrapper.find(".govuk-error-summary__list").first();
    const summaryErrorTitle = wrapper.find("#error-summary-title");
    const inputError = wrapper.find("#error-already-exists");

    expect(summaryErrorList.text()).to.equal(
      "A form with this name already exists"
    );
    expect(summaryErrorTitle.text()).to.equal("There is a problem");
    expect(inputError.text()).to.equal("A form with this name already exists");
  });

  test("Enter form name error shown correctly", async () => {
    formConfigurationApiStub = sinon
      .stub(formConfigurationsApi, "loadConfigurations")
      .resolves(configurations);

    const wrapper = shallow(<NewConfig history={history} />);
    await wait();

    wrapper.find("button").simulate("click", { preventDefault: sinon.stub() });

    const summaryErrorList = wrapper.find(".govuk-error-summary__list").first();
    const summaryErrorTitle = wrapper.find("#error-summary-title");
    const inputError = wrapper.find("#error-name-required");

    expect(summaryErrorList.text()).to.equal("Enter form name");
    expect(summaryErrorTitle.text()).to.equal("There is a problem");
    expect(inputError.text()).to.equal("Enter form name");
  });
});
