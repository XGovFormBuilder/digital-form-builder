import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import SelectField from "../../src/components/selectfield";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Select field", () => {
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
      values: {
        type: "static",
        valueType: "string",
        items: items,
      },
    };
    const model = {
      lists: [],
    };
    const underTest = new SelectField(def, model);
    const returned = underTest.getViewModel({ lang: "en" });

    expect(returned.label).to.equal({
      classes: "govuk-label--s",
      text: def.title,
    });
    expect(returned.items).to.equal([
      { text: "" },
      {
        selected: false,
        text: "A thing",
        value: "myThing",
        condition: "aCondition",
      },
      {
        selected: false,
        text: "Another thing",
        value: "myOtherThing",
        condition: undefined,
      },
    ]);
  });
});
