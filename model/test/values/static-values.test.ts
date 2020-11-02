import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { StaticValues } from "../../src/values";
import { StaticValue } from "../../src/values/static-values";

const { expect } = Code;

const lab = Lab.script();
exports.lab = lab;
const { describe, test, beforeEach } = lab;

describe("Values - StaticValue(s)", () => {
  let staticObj: any;

  beforeEach(() => {
    staticObj = {
      type: "static",
      valueType: "string",
      items: [
        {
          label: "Label",
          value: "Value",
          hint: "Hint",
          condition: "Condition",
          children: [
            {
              name: "ChildrenName",
            },
          ],
        },
      ],
    };
  });

  test("StaticValue.from builds correct StaticValue", () => {
    const result: any = StaticValue.from(staticObj.items[0]);
    expect(result instanceof StaticValue).to.be.true();
    expect(result).to.contain(staticObj.items[0]);
  });

  test("StaticValues.from builds StaticValues", () => {
    const result: any = StaticValues.from(staticObj);

    // StaticValues
    expect(result instanceof StaticValues).to.be.true();
    expect(result.type).to.equal("static");
    expect(result.valueType).to.equal("string");

    // item is StaticValue
    expect(result.items[0] instanceof StaticValue).to.equal(true);
    expect(result.items[0]).to.contain(staticObj.items[0]);
  });

  test("StaticValues.from throws when type is not 'static'", () => {
    const obj = {
      ...staticObj,
      type: "wrong",
    };

    expect(() => StaticValues.from(obj)).to.throw(
      Error,
      `Cannot create from non static values object ${JSON.stringify(obj)}`
    );
  });

  test("toStaticValues returns itself", () => {
    const result: any = StaticValues.from(staticObj);
    expect(result.toStaticValues()).to.equal(result);
  });
});
