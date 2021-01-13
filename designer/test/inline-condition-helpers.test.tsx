import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import InlineConditionHelpers from "../client/conditions/inline-condition-helpers";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { beforeEach, suite, test } = lab;

suite("Inline condition helpers", () => {
  let data;

  beforeEach(() => {
    data = {
      getId: sinon.stub(),
      addCondition: sinon.stub(),
    };
  });

  test("should save conditions if provided", async () => {
    const amendedData = sinon.stub();
    data.addCondition.returns(amendedData);
    const conditions = {
      name: "My condition",
      hasConditions: true,
    };
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      data,
      conditions
    );

    expect(data.addCondition.calledOnce).to.equal(true);

    expect(data.addCondition.firstCall.args[1]).to.equal("My condition");
    expect(data.addCondition.firstCall.args[2]).to.equal(conditions);
    expect(returned).to.contain({ data: amendedData });
  });

  test("should not save conditions if provided with no conditions added", async () => {
    data.getId.resolves("abcdef");
    const conditions = {
      name: "My condition",
      hasConditions: false,
    };
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      data,
      conditions
    );

    expect(data.getId.called).to.equal(false);
    expect(data.addCondition.called).to.equal(false);
    expect(returned).to.equal({ data: data, condition: undefined });
  });

  test("should return unsaved data no conditions provided", async () => {
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      data,
      undefined
    );

    expect(data.getId.called).to.equal(false);
    expect(data.addCondition.called).to.equal(false);
    expect(returned).to.equal({ data: data, condition: undefined });
  });

  test("should return undefined condition if nothing provided", async () => {
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      undefined,
      undefined
    );

    expect(data.getId.called).to.equal(false);
    expect(data.addCondition.called).to.equal(false);
    expect(returned).to.equal({ data: undefined, condition: undefined });
  });
});
