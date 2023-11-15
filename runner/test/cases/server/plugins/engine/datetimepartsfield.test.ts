import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { DateTimePartsField } from "src/server/plugins/engine/components/DateTimePartsField";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Date time parts field", () => {
  test("Should construct appropriate children when required", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      options: {},
      schema: {},
    };
    const underTest = new DateTimePartsField(def, {});
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
      dateComponent("Hour", 2),
      dateComponent("Minute", 2),
    ]);
  });

  test("Should construct appropriate children when not required", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      options: { required: false },
      schema: {},
    };
    const underTest = new DateTimePartsField(def, {});
    const returned = underTest.getViewModel({ lang: "en" });

    expect(returned.fieldset).to.equal({
      legend: {
        classes: "govuk-label--s",
        text: `${def.title} (optional)`,
      },
    });
    expect(returned.items).to.equal([
      dateComponent("Day", 2),
      dateComponent("Month", 2),
      dateComponent("Year", 4),
      dateComponent("Hour", 2),
      dateComponent("Minute", 2),
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
    attributes: {},
  };
}
