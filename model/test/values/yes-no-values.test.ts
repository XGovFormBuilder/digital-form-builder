import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { valuesFrom } from "../../src/values/helpers";
import { StaticValues } from "../../src/values";
import { StaticValue } from "../../src/values/static-values";

const { expect } = Code;

const lab = Lab.script();
exports.lab = lab;
const { describe, test } = lab;

describe.only("Values - Yes/No Values", () => {
  test("valuesFrom build yeas-no-values", () => {
    const obj: any = {
      type: "static",
      valueType: "boolean",
      items: [
        {
          label: "Yes",
          value: true,
          hint: "HintYes",
          condition: "ConditionYes",
          children: [],
        },
        {
          label: "No",
          value: false,
          hint: "HintNo",
          condition: "ConditionNo",
          children: [],
        },
      ],
    };

    const result: any = valuesFrom(obj);

    expect(result instanceof StaticValues).to.be.true();
    expect(result.type).to.equal("static");
    expect(result.valueType).to.equal("boolean");

    // yes
    const yes = result.items[0];
    expect(yes instanceof StaticValue).to.be.true();
    expect(yes).to.contain(obj.items[0]);

    // no
    const no = result.items[1];
    expect(no instanceof StaticValue).to.be.true();
    expect(no).to.contain(obj.items[1]);
  });
});
