import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import ConditionEdit from "../client/condition-edit";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";
import { assertTextInput } from "./helpers/element-assertions";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Condition edit", () => {
  const data = new Data({
    conditions: [
      { name: "abdefg", displayName: "My condition", value: "badgers" },
    ],
  });

  test("Renders a form with display name and condition editor inputs", () => {
    const wrapper = shallow(
      <ConditionEdit condition={data.findCondition("abdefg")} data={data} />
    );
    const form = wrapper.find("form");
    const displayNameInput = form.find("input");
    assertTextInput({
      wrapper: displayNameInput,
      id: "condition-name",
      expectedValue: "My condition",
    });

    const editor = form.find("Editor");
    expect(editor.prop("name")).to.equal("value");
    expect(editor.prop("value")).to.equal("badgers");
    expect(Object.keys(editor.props()).includes("required")).to.equal(true);
    expect(editor.prop("valueCallback")).to.equal(
      wrapper.instance().onValueChange
    );
  });

  test("Should set error message when setting display name to one that already exists", () => {
    const wrapper = shallow(
      <ConditionEdit condition={data.findCondition("abdefg")} data={data} />
    );
    const form = wrapper.find("form");
    const displayNameInput = form.find("input");
    const setCustomValidity = sinon.spy();
    data.addCondition("something", "My condition", "badger == monkeys");
    displayNameInput.simulate("blur", {
      target: { value: "My condition", setCustomValidity: setCustomValidity },
    });

    expect(setCustomValidity.calledOnce).to.equal(true);
    expect(setCustomValidity.firstCall.args[0]).to.equal(
      "Display name 'My condition' already exists"
    );
  });

  //FIXME:- should check if the data context has updated.
  test.skip("Submitting the form updates the condition and calls back", async (flags) => {
    const clonedData = {
      updateCondition: sinon.stub(),
    };
    const updatedData = sinon.spy();
    const savedData = sinon.spy();
    const onEdit = (data) => {
      expect(data.data).to.equal(savedData);
    };
    const wrappedOnEdit = flags.mustCall(onEdit, 1);
    const wrapper = shallow(
      <ConditionEdit
        condition={data.findCondition("abdefg")}
        data={data}
        onEdit={wrappedOnEdit}
      />
    );
    const form = wrapper.find("form");
    const displayNameInput = form.find("input");
    const preventDefault = sinon.spy();
    const setCustomValidity = sinon.spy();
    displayNameInput.simulate("blur", {
      target: { value: "My condition 2", setCustomValidity: setCustomValidity },
    });
    wrapper.instance().onValueChange("badger == monkeys");

    data.save = sinon.stub();
    data.clone = sinon.stub();
    data.clone.returns(clonedData);
    clonedData.updateCondition.returns(updatedData);
    data.save.resolves(savedData);

    await wrapper.simulate("submit", { preventDefault: preventDefault });

    expect(preventDefault.calledOnce).to.equal(true);
    expect(clonedData.updateCondition.calledOnce).to.equal(true);
    expect(clonedData.updateCondition.firstCall.args[0]).to.equal("abdefg");
    expect(clonedData.updateCondition.firstCall.args[1]).to.equal(
      "My condition 2"
    );
    expect(clonedData.updateCondition.firstCall.args[2]).to.equal(
      "badger == monkeys"
    );
    expect(data.save.calledOnce).to.equal(true);
    expect(data.save.firstCall.args[0]).to.equal(updatedData);
  });

  test.skip("Submitting the form with no changes updates the condition and calls back", async (flags) => {
    const clonedData = {
      updateCondition: sinon.stub(),
    };
    const updatedData = sinon.spy();
    const savedData = sinon.spy();
    const onEdit = (data) => {
      expect(data.data).to.equal(savedData);
    };
    const wrappedOnEdit = flags.mustCall(onEdit, 1);
    const wrapper = shallow(
      <ConditionEdit
        condition={data.findCondition("abdefg")}
        data={data}
        onEdit={wrappedOnEdit}
      />
    );
    const preventDefault = sinon.spy();

    data.save = sinon.stub();
    data.clone = sinon.stub();
    data.clone.returns(clonedData);
    clonedData.updateCondition.returns(updatedData);
    data.save.resolves(savedData);

    await wrapper.simulate("submit", { preventDefault: preventDefault });

    expect(preventDefault.calledOnce).to.equal(true);
    expect(clonedData.updateCondition.calledOnce).to.equal(true);
    expect(clonedData.updateCondition.firstCall.args[0]).to.equal("abdefg");
    expect(clonedData.updateCondition.firstCall.args[1]).to.equal(
      "My condition"
    );
    expect(clonedData.updateCondition.firstCall.args[2]).to.equal("badgers");
    expect(data.save.calledOnce).to.equal(true);
    expect(data.save.firstCall.args[0]).to.equal(updatedData);
  });

  test("Cancelling the form calls the onCancel callback", async (flags) => {
    const event = { target: {} };
    const onCancel = (e) => {
      expect(e).to.equal(event);
    };
    const wrappedOnCancel = flags.mustCall(onCancel, 1);
    const wrapper = shallow(
      <ConditionEdit
        condition={data.findCondition("abdefg")}
        data={data}
        onCancel={wrappedOnCancel}
      />
    );
    const form = wrapper.find("form");
    const backLink = form.find("a.govuk-back-link");
    await backLink.simulate("click", event);
  });
});
