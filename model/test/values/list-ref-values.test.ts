import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { Data } from "../../src";
import { StaticValues } from "../../src/values";
import { ListRefValues, ValueChildren } from "../../src/values/list-ref-values";

const { expect } = Code;

const lab = Lab.script();
exports.lab = lab;
const { describe, test, beforeEach } = lab;

describe("Values - ListRefValues", () => {
  let listRefObj: any;

  beforeEach(() => {
    listRefObj = {
      type: "listRef",
      list: "myList",
      valueChildren: [
        {
          value: 365,
          children: [
            {
              name: "Name",
              type: "RadiosField",
              options: {},
              values: {
                list: "anotherList",
                type: "listRef",
                valueChildren: [],
              },
            },
          ],
        },
      ],
    };
  });

  test("ListRefValues.from builds ListRefValues", () => {
    const result: any = ListRefValues.from(listRefObj);

    // ListRefValues
    expect(result instanceof ListRefValues).to.be.true();
    expect(result.type).to.equal("listRef");

    // valueChildren
    const { valueChildren } = result;
    expect(valueChildren[0] instanceof ValueChildren).to.be.true();
    expect(valueChildren[0]).to.contain(listRefObj.valueChildren[0]);
  });

  test("toStaticValues builds correct static values", () => {
    const rawData: any = {
      pages: [],
      conditions: [],
      feedback: {},
      lists: [
        {
          name: "myList",
          type: "string",
          items: [
            {
              text: "some stuff",
              value: "myValue",
              description: "A hint",
              condition: "badger",
            },
            { text: "another thing", value: "anotherValue" },
          ],
        },
      ],
    };
    const data = new Data(rawData);

    const litRefValues = new ListRefValues("myList", []);

    const result = litRefValues.toStaticValues(data);

    expect(result instanceof StaticValues).to.be.true();
    expect(result.type).to.equal("static");
    expect(result.valueType).to.equal("string");
    expect(result.items[0]).to.contain({
      label: "some stuff",
      value: "myValue",
      hint: "A hint",
      condition: "badger",
      children: [],
    });
    expect(result.items[1]).to.contain({
      label: "another thing",
      value: "anotherValue",
      hint: undefined,
      condition: undefined,
    } as any);
  });
});
