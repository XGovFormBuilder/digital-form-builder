import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { valuesFrom } from "../../src/values/helpers";
import { StaticValues } from "../../src/values";
import { ListRefValues } from "../../src/values/listref-values";

const { expect } = Code;

const lab = Lab.script();
exports.lab = lab;
const { describe, test } = lab;

describe("Values - Helpers", () => {
  test("valuesFrom builds StaticValues", () => {
    const obj: any = {
      type: "static",
    };

    const result: any = valuesFrom(obj);
    expect(result instanceof StaticValues).to.be.true();
    expect(result.type).to.equal("static");
  });

  test("valuesFrom builds ListRefValues", () => {
    const obj: any = {
      type: "listRef",
    };

    const result: any = valuesFrom(obj);
    expect(result instanceof ListRefValues).to.be.true();
    expect(result.type).to.equal("listRef");
  });

  test("valuesFrom throws when value type is unknown", () => {
    const obj: any = {
      type: "bananas",
    };

    expect(() => valuesFrom(obj)).to.throw(
      Error,
      'No constructor found for object {"type":"bananas"}'
    );
  });
});
