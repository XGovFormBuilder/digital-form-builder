import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { withI18n, i18n, initI18n } from "..";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { before, suite, test } = lab;

suite("I18n", () => {
  before(() => {
    initI18n();
  });

  test("withI18n HOC passes down i18n translation function", () => {
    function Component({ i18n }) {
      return <div>{i18n("Test")}</div>;
    }

    const WithI18nComponent = withI18n(Component);
    const wrapper = shallow(<WithI18nComponent />);
    expect(wrapper.find(Component).prop("i18n")).to.exist();
  });

  test("withI18n translation is correct", () => {
    function Component({ i18n }) {
      return <div>{i18n("Test")}</div>;
    }

    const WithI18nComponent = withI18n(Component);
    const wrapper = shallow(<WithI18nComponent />);
    const translation = wrapper.find(Component).prop("i18n")("Test");
    expect(translation).to.equal("For testing purpose, do not delete it");
  });

  test("i18n translates correctly", () => {
    const translation = i18n("Test");
    expect(translation).to.equal("For testing purpose, do not delete it");
  });
});
