import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { stub } from "sinon";
import NewConfig from "../client/new-config";

import formConfigurationsApi from "../client/load-form-configurations";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, afterEach } = lab;

const configurations = [
  {
    Key: "111.json",
    LastModified: "2020-08-03T14:39:45.000Z",
  },
  {
    Key: "123.json",
    LastModified: "2020-08-03T14:18:50.000Z",
  },
  {
    Key: "1234.json",
    LastModified: "2020-08-03T14:20:48.000Z",
  },
];

suite("New configuration screen", () => {
  let formConfigurationApiStub;

  afterEach(() => {
    formConfigurationApiStub.restore();
  });

  test("Should show no existing configurations found message", () => {
    formConfigurationApiStub = stub(
      formConfigurationsApi,
      "loadConfigurations"
    ).resolves([]);
    const wrapper = shallow(<NewConfig />);
    expect(wrapper.find("#hint-none-found").exists()).to.equal(true);
  });

  const wait = () => new Promise((resolve) => setTimeout(resolve));

  test("Loads configurations into select", () => {
    formConfigurationApiStub = stub(
      formConfigurationsApi,
      "loadConfigurations"
    ).resolves(configurations);
    const wrapper = shallow(<NewConfig />);

    return wait().then(() => {
      wrapper.update();
      expect(wrapper.state("configs")).to.have.length(3);
      expect(wrapper.find("option")).to.have.length(4);
    });
  });

  test("Button is disabled and shows a message when input matches an existing configuration", () => {
    formConfigurationApiStub = stub(
      formConfigurationsApi,
      "loadConfigurations"
    ).resolves(configurations);
    const wrapper = shallow(<NewConfig />);
    wrapper.setState({ configs: configurations });
    const input = wrapper.find("input");
    input.simulate("change", { target: { value: "111" } });
    expect(wrapper.find("#error-already-exists").exists()).to.equal(true);
  });

  test("Input replaces whitespace with '-' on input change", () => {
    formConfigurationApiStub = stub(
      formConfigurationsApi,
      "loadConfigurations"
    ).resolves(configurations);
    const wrapper = mount(<NewConfig />);
    const input = wrapper.find("input");
    input.simulate("change", { target: { value: "string with spaces" } });
    wrapper.update();
    expect(wrapper.state("newName")).to.be.equal("string-with-spaces");
  });
});
