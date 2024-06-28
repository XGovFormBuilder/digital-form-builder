import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { MonthYearField } from "src/server/plugins/engine/components";
import { messages } from "../../../../../src/server/plugins/engine/pageControllers/validationOptions";
import joi from "joi";
const lab = Lab.script();
exports.lab = lab;
const { suite, test } = lab;
const { expect } = Code;

/**
 * This replicates {@link PageControllerBase.validate}
 */
const validate = (schema, value) => {
  return schema.validate(value, { messages });
};

suite("Month Year Field", () => {
  test("Should validate month and year correctly", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      type: "MonthYearField",
      options: {},
    };

    const monthYearField = new MonthYearField(def);

    /**
     * This replicates {@link ComponentCollection.formSchema}
     */
    const schema = joi
      .object()
      .keys(monthYearField.getFormSchemaKeys())
      .required();

    expect(
      validate(schema, {
        myComponent__year: 2000,
        myComponent__month: 0,
      }).error.message
    ).to.contain("must be between 1 and 12");

    expect(
      validate(schema, {
        myComponent__year: 1,
        myComponent__month: 12,
      }).error.message
    ).to.contain("must be 1000 or higher");

    expect(
      validate(schema, {
        myComponent__year: 2000,
        myComponent__month: 12,
      }).error
    ).to.be.undefined();
  });
});
