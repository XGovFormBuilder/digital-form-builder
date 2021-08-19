import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { EmailAddressField } from "src/server/plugins/engine/components";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, test } = lab;

suite("Email address field", () => {
  test("Should add 'email' to the autocomplete attribute", () => {
    const def = {
      name: "myComponent",
      title: "My component",
      hint: "a hint",
      options: {},
      schema: {},
    };
    const emailAddressField = new EmailAddressField(def, {});
    expect(emailAddressField.getViewModel({})).to.contain({
      autocomplete: "email",
    });
  });
});
