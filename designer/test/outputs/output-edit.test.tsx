import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { ErrorSummary } from "../../client/error-summary";
import { Data } from "@xgovformbuilder/model";
import { assertSelectInput } from "../helpers/element-assertions";
import { assertInputControlProp } from "../helpers/sub-component-assertions";
import OutputEdit from "../../client/outputs/output-edit";
import { Output } from "../../client/outputs/types";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, describe } = lab;

suite("Output edit", () => {
  const data = new Data({
    pages: [
      {
        path: "/1",
        title: "My first page",
        section: "badger",
        controller: "./pages/start.js",
      },
    ],
    outputs: [
      {
        name: "hookme",
        title: "publish to github",
        type: "webhook",
        outputConfiguration: {
          url: "http://forms-api:9000/v1/forms",
        },
      },
    ],
  });
  describe("Renders", () => {
    test("email output", () => {
      const output = {
        name: "emailme",
        title: "send to gmail",
        outputConfiguration: {
          emailAddress: "test@test.com",
        },
      };

      const onEdit = sinon.spy();
      const onCancel = sinon.spy();
      const wrapper = shallow(
        <OutputEdit
          data={data}
          output={output as Output}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      );
      assertInputControlProp({
        wrapper,
        id: "output-title",
        prop: "defaultValue",
        expectedValue: "send to gmail",
      });
      assertInputControlProp({
        wrapper,
        id: "output-name",
        prop: "defaultValue",
        expectedValue: "emailme",
      });
      assertSelectInput({
        wrapper: wrapper.find("#output-type"),
        id: "output-type",
        expectedFieldOptions: [
          { value: "email", text: "Email" },
          { value: "notify", text: "Email via GOVUK Notify" },
          { value: "webhook", text: "Webhook" },
        ],
        expectedValue: "email",
      });
      const emailWrapper = wrapper.find("EmailEdit").dive();
      assertInputControlProp({
        wrapper: emailWrapper,
        id: "email-address",
        prop: "defaultValue",
        expectedValue: "test@test.com",
      });
    });
  });

  describe("Validation", () => {
    test("email output", () => {
      const output = {
        name: "emailme",
      };

      const onEdit = sinon.spy();
      const onCancel = sinon.spy();
      const wrapper = mount(
        <OutputEdit
          data={data}
          output={output as Output}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      );
      const form = wrapper.find("form").first();
      form.simulate("submit", { preventDefault: sinon.spy() });
      wrapper.update();
      expect(wrapper.find(ErrorSummary).exists()).to.equal(true);
      const errorList: Array<any> = wrapper
        .find(ErrorSummary)
        .prop("errorList");
      expect(errorList.length).to.equal(2);
      expect(errorList[0]).to.contain({
        children: ["Enter Output title"],
        href: "#output-title",
      });
      expect(errorList[1]).to.contain({
        children: ["Enter Email address"],
        href: "#email-address",
      });
    });
  });
});
