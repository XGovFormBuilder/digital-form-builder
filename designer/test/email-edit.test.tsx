import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import EmailEdit from "../client/outputs/email-edit";
const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Email edit", () => {
  test("renders with correct class", () => {
    expect(shallow(<EmailEdit />).is(".email-edit")).to.equal(true);
  });
  test("renders with correct class when required field error", () => {
    let errors = { email: true };
    let wrapper = shallow(<EmailEdit errors={errors} />);

    expect(wrapper.find("div.govuk-form-group--error")).to.exist();
  });
});
