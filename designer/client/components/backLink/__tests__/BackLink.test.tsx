import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import { BackLink } from "..";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, describe } = lab;

describe("BackLink Component", () => {
  test("it renders correctly", () => {
    const wrapper = shallow(<BackLink>Go Back</BackLink>);
    expect(wrapper.text()).to.equal("Go Back");
    expect(wrapper.props()).to.include({
      className: "back-link govuk-back-link",
      href: "#0",
    });
  });

  test("it passes href prop", () => {
    const wrapper = shallow(<BackLink href="test">Go Back</BackLink>);
    expect(wrapper.text()).to.equal("Go Back");
    expect(wrapper.prop("href")).to.equal("test");
  });

  test("it passes onClick prop", () => {
    const onClick = sinon.stub();
    const wrapper = shallow(<BackLink onClick={onClick}>Go Back</BackLink>);

    wrapper.simulate("click");
    expect(onClick.calledOnce).to.be.true();
  });
});
