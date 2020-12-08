import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";

import OutputEdit from "../client/outputs/output-edit";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, beforeEach } = lab;

suite("OutputEdit", () => {
  let props;

  beforeEach(() => {
    props = {
      onEdit: sinon.stub(),
      onCancel: sinon.stub(),
      data: {},
      output: {},
    };
  });

  test("renders default email output option", () => {
    const wrapper = shallow(<OutputEdit {...props} />);
    const outputSelect = wrapper.find("#output-type").first();
    expect(outputSelect.prop("value")).to.equal("email");
  });

  test("renders EmailEdit component", () => {
    const wrapper = shallow(<OutputEdit {...props} />);
    const emailEdit = wrapper.find("EmailEdit");
    expect(emailEdit.length).to.equal(1);
  });
});
