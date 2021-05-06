import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import InlineConditionHelpers from "../client/conditions/inline-condition-helpers";
import { FormDefinition } from "@xgovformbuilder/model";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;

suite("Inline condition helpers", () => {
  let data: FormDefinition = {
    conditions: [],
    lists: [],
    pages: [],
    sections: [],
  };

  test("should save conditions if provided", async () => {
    const conditionsModel = {
      name: "My condition",
      hasConditions: true,
      conditions: [
        {
          name: "hasUKPassport",
          value: "checkBeforeYouStart.ukPassport==true",
        },
      ],
    };

    const returned = InlineConditionHelpers.storeConditionIfNecessary(
      data,
      conditionsModel
    );

    expect(returned.data.conditions[0].conditions).to.contain(
      conditionsModel.conditions
    );
    expect(returned.condition).to.be.a.string();
  });

  test("should not save conditions if provided with no conditions added", async () => {
    const conditions = {
      name: "My condition",
      hasConditions: false,
    };
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      data,
      conditions
    );

    expect(returned).to.equal({ data: data, condition: undefined });
  });

  test("should return unsaved data no conditions provided", async () => {
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      data,
      undefined
    );
    expect(returned).to.equal({ data: data, condition: undefined });
  });

  test("should return undefined condition if nothing provided", async () => {
    const returned = await InlineConditionHelpers.storeConditionIfNecessary(
      undefined,
      undefined
    );
    expect(returned).to.equal({ data: undefined, condition: undefined });
  });
});
