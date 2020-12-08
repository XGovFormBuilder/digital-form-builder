import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { RadiosField } from "src/server/plugins/engine/components/RadiosField";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Radios field", () => {
  test("Should construct appropriate model for items", () => {
    const items = [
      {
        label: "A thing",
        value: "myThing",
        condition: "aCondition",
        hint: "Jobbie",
      },
      {
        label: "Another thing",
        value: "myOtherThing",
        something: "Something else",
      },
    ];
    const def = {
      name: "myComponent",
      title: "My component",
      options: {},
      schema: {},
      values: { type: "static", valueType: "string", items: items },
    };
    const model = {};
    const underTest = new RadiosField(def, model);
    const returned = underTest.getViewModel({ lang: "en" });

    expect(returned.fieldset).to.equal({
      legend: {
        classes: "govuk-label--s",
        text: def.title,
      },
    });
    expect(returned.items).to.equal([
      {
        checked: false,
        html: "A thing",
        value: "myThing",
        condition: "aCondition",
        hint: { html: "Jobbie" },
      },
      {
        checked: false,
        html: "Another thing",
        value: "myOtherThing",
        condition: undefined,
      },
    ]);
  });
});
