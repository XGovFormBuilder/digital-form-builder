import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { WebsiteFieldComponent } from "@xgovformbuilder/model";
import { WebsiteField } from "src/server/plugins/engine/components";
import { FormModel } from "src/server/plugins/engine/models";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { beforeEach, suite, test } = lab;

suite("Telephone number field", () => {
  let model: FormModel;

  beforeEach(() => {
    model = {} as FormModel;
  });

  test("should be required by default", () => {
    const def: WebsiteFieldComponent = {
      name: "myComponent",
      title: "My component",
      type: "WebsiteField",
      hint: "a hint",
      options: {},
      schema: {},
    };

    const { formSchema } = new WebsiteField(def, model);

    expect(formSchema.describe().flags!["presence"]).to.equal("required");
  });

  test("should validate URI", () => {
    const def: WebsiteFieldComponent = {
      name: "myComponent",
      title: "My component",
      type: "WebsiteField",
      hint: "a hint",
      options: {},
      schema: {},
    };

    const { formSchema } = new WebsiteField(def, model);

    expect(formSchema.validate("https://www.gov.uk").error).to.be.undefined();
    expect(
      formSchema.validate("http://www.gov.uk/test?id=ABC").error
    ).to.be.undefined();
    expect(formSchema.validate("1").error!.message).to.contain(
      `"value" must be a valid uri`
    );
    // expect(result.validate("12-3").error?.message).to.contain(
    //   "Enter a telephone number in the correct format"
    // );
    // expect(result.validate("1  1").error?.message).to.contain(
    //   "Enter a telephone number in the correct format"
    // );
  });

  test("should validate max length", () => {
    const def: WebsiteFieldComponent = {
      name: "myComponent",
      title: "My component",
      type: "WebsiteField",
      hint: "a hint",
      options: {},
      schema: {
        max: 17,
      },
    };

    const { formSchema } = new WebsiteField(def, model);

    expect(formSchema.validate("http://www.gov.uk").error).to.be.undefined();

    expect(formSchema.validate("https://www.gov.uk").error?.message).to.contain(
      `"value" length must be less than or equal to 17 characters long`
    );
  });

  test("should validate min length", () => {
    const def: WebsiteFieldComponent = {
      name: "myComponent",
      title: "My component",
      type: "WebsiteField",
      hint: "a hint",
      options: {},
      schema: {
        min: 18,
      },
    };

    const { formSchema } = new WebsiteField(def, model);

    expect(formSchema.validate("https://www.gov.uk").error).to.be.undefined();

    expect(formSchema.validate("http://www.gov.uk").error?.message).to.contain(
      `"value" length must be at least 18 characters long`
    );
  });
});
