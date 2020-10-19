import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import DatePartsField from "../../src/components/datepartsfield";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Date parts field", () => {
  test("Should construct appropriate children when required", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      options: {},
      schema: {},
    };
    const underTest = new DatePartsField(def, {});
    const returned = underTest.getViewModel({ lang: "en" });

    expect(returned.fieldset).to.equal({
      legend: {
        classes: "govuk-label--s",
        text: def.title,
      },
    });
    expect(returned.items).to.equal([
      dateComponent("Day", 2),
      dateComponent("Month", 2),
      dateComponent("Year", 4),
    ]);
  });

  test("Should construct appropriate children when not required", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      options: { required: false },
      schema: {},
    };
    const underTest = new DatePartsField(def, {});
    const returned = underTest.getViewModel({ lang: "en" });

    expect(returned.fieldset).to.equal({
      legend: {
        classes: "govuk-label--s",
        text: `${def.title} (Optional)`,
      },
    });
    expect(returned.items).to.equal([
      dateComponent("Day", 2),
      dateComponent("Month", 2),
      dateComponent("Year", 4),
    ]);
  });
});

function dateComponent(name, width) {
  return {
    label: name,
    id: `myComponent__${name.toLowerCase()}`,
    name: `myComponent__${name.toLowerCase()}`,
    value: undefined,
    classes: `govuk-input--width-${width}`,
    type: "number",
  };
}
