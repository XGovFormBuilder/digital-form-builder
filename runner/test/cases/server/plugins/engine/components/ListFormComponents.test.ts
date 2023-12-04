import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import sinon from "sinon";
import { ListFormComponent } from "server/plugins/engine/components/ListFormComponent";
import { FormSubmissionState } from "server/plugins/engine";
const lab = Lab.script();
exports.lab = lab;
const { expect } = Code;
const { suite, describe, it, beforeEach } = lab;

const lists = [
  {
    title: "Turnaround",
    name: "Turnaround",
    type: "string",
    items: [
      { text: "1 hour", value: "1" },
      { text: "2 hours", value: "2" },
    ],
  },
];

const componentDefinition = {
  subType: "field",
  type: "ListFormComponent",
  name: "MyListFormComponent",
  title: "Turnaround?",
  options: {},
  list: "Turnaround",
  schema: {},
};

let formModel = {
  getList: () => lists[0],
  makePage: () => sinon.stub(),
};

suite("ListFormComponent", () => {
  let component;

  beforeEach(() => {
    component = new ListFormComponent(componentDefinition, formModel);
  });

  describe("getDisplayStringFromState", () => {
    it("it gets value correctly when state value is string", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyListFormComponent: "2",
      };
      expect(component.getDisplayStringFromState(state)).to.equal("2 hours");
      expect(component.getViewModel(state).value).to.equal("2");
    });

    it("it gets value correctly when state value is number", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyListFormComponent: 2,
      };
      expect(component.getDisplayStringFromState(state)).to.equal("2 hours");
      expect(component.getViewModel(state).value).to.equal(2);
    });
  });
});

describe("ListFormComponent optional validation", () => {
  const optionalComponent = new ListFormComponent(
    {
      ...componentDefinition,
      options: {
        required: false,
      },
    },
    formModel
  );

  it("schema validates correctly when the field is optional", () => {
    const schema = optionalComponent.formSchema;

    expect(schema.validate("1").error).to.not.exist();
    expect(schema.validate("2").error).to.not.exist();
    expect(schema.validate("").error).to.not.exist();
    expect(schema.validate(null).error).to.not.exist();

    const errorMessage = '"turnaround?" must be one of [1, 2, ]';
    expect(schema.validate(10).error.message).to.be.equal(errorMessage);
    expect(schema.validate("ten").error.message).to.be.equal(errorMessage);
    expect(schema.validate(2).error.message).to.be.equal(errorMessage);
  });
});
