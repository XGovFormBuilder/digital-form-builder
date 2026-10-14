import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { ConditionalRadiosField } from "server/plugins/engine/components/ConditionalRadiosField";

const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { describe, it } = lab;

const definition = {
  type: "ConditionalRadiosField",
  name: "title",
  title: "Title of person",
  list: "titlesList",
  options: {},
  schema: {},
};

const model = {
  getList: () => ({
    name: "titlesList",
    title: "titlesList",
    type: "string",
    items: [
      { type: "HiddenField", value: "mr", label: "Mr" },
      { type: "HiddenField", value: "mrs", label: "Mrs" },
      { divider: "or" },
      { type: "TextField", label: "Other title" },
    ],
  }),
} as any;

describe("ConditionalRadiosField", () => {
  it("accepts fixed and custom submissions and normalizes them", () => {
    const component = new ConditionalRadiosField(definition, model);

    expect(component.formSchema.validate("mr").error).to.not.exist();
    expect(
      component.formSchema.validate(["__custom", "Dr"]).error
    ).to.not.exist();
    expect(
      component.formSchema.validate(["__custom", "Test"]).error
    ).to.not.exist();
    expect(component.formSchema.validate("Test").error).to.not.exist();
    expect(component.formSchema.validate(["__custom", ""]).error).to.exist();
    expect(component.getStateFromValidForm({ title: "mr" })).to.equal({
      title: "Mr",
    });
    expect(component.getStateFromValidForm({ title: "Mr" })).to.equal({
      title: "Mr",
    });
    expect(
      component.getStateFromValidForm({ title: ["__custom", "Dr"] })
    ).to.equal({
      title: "Dr",
    });
    expect(component.getStateFromValidForm({ title: ["mr", "Dr"] })).to.equal({
      title: "Mr",
    });

    const revisitViewModel = component.getViewModel({ title: "Mr" }, {} as any);
    expect(revisitViewModel.fieldset?.legend?.text).to.equal("Title of person");
    expect(revisitViewModel.fieldset?.legend?.classes).to.equal(
      "govuk-fieldset__legend govuk-fieldset__legend--s"
    );
    expect(revisitViewModel.items[0].checked).to.equal(true);
    expect(revisitViewModel.items[3].checked).to.equal(false);
  });

  it("renders the divider and pre-populates the custom field", () => {
    const component = new ConditionalRadiosField(definition, model);
    const viewModel = component.getViewModel(
      { title: ["__custom", "Dr"] },
      {} as any
    );

    expect(viewModel.items[2].divider).to.equal("or");
    expect(viewModel.items[3].checked).to.equal(true);
    expect(viewModel.items[3].conditional.html).to.not.contain("Other title");
    expect(viewModel.items[3].conditional.html).to.contain('value="Dr"');
  });
});
