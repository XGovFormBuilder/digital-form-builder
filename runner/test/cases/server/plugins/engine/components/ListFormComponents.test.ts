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

suite("ListFormComponent", () => {
  let componentDefinition;
  let formModel;
  let component;

  beforeEach(() => {
    componentDefinition = {
      subType: "field",
      type: "ListFormComponent",
      name: "MyListFormComponent",
      title: "Turnaround?",
      options: {},
      list: "Turnaround",
      schema: {},
    };

    formModel = {
      getList: () => lists[0],
      makePage: () => sinon.stub(),
    };

    component = new ListFormComponent(componentDefinition, formModel);
  });

  describe("getDisplayStringFromState", () => {
    it("it gets value correctly when state value is string", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyListFormComponent: "2",
      };
      expect(component.getDisplayStringFromState(state)).to.equal("2");
    });

    it("it gets value correctly when state value is number", () => {
      const state: FormSubmissionState = {
        progress: [],
        MyListFormComponent: 2,
      };
      expect(component.getDisplayStringFromState(state)).to.equal("2");
    });
  });
});
