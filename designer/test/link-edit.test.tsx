import React from "react";
import { shallow, mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data } from "@xgovformbuilder/model";
import sinon from "sinon";
import { assertSelectInput } from "./helpers/element-assertions";
import LinkEdit from "../client/link-edit";
import { DataContext } from "../client/context";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, describe } = lab;

suite("Link edit", () => {
  describe("Editing a link which does not have a condition", () => {
    const data = new Data({
      pages: [
        { path: "/1", title: "Page 1", next: [{ path: "/2" }] },
        { path: "/2", title: "Page 2" },
      ],
      conditions: [
        { name: "someCondition", displayName: "My condition" },
        { name: "anotherCondition", displayName: "Another condition" },
      ],
    });
    const edge = {
      source: "/1",
      target: "/2",
    };

    test("Renders a form with expected inputs", () => {
      const wrapper = shallow(<LinkEdit data={data} edge={edge} />);
      const form = wrapper.find("form");

      const fromInput = form.find("#link-source");
      assertSelectInput({
        wrapper: fromInput,
        id: "link-source",
        expectedFieldOptions: [
          { text: "" },
          { value: "/1", text: "Page 1" },
          { value: "/2", text: "Page 2" },
        ],
        expectedValue: "/1",
      });
      expect(fromInput.prop("disabled")).to.equal(true);

      const toInput = form.find("#link-target");
      assertSelectInput({
        wrapper: toInput,
        id: "link-target",
        expectedFieldOptions: [
          { text: "" },
          { value: "/1", text: "Page 1" },
          { value: "/2", text: "Page 2" },
        ],
        expectedValue: "/2",
      });
      expect(toInput.prop("disabled")).to.equal(true);

      const selectConditions = wrapper.find("SelectConditions");
      expect(selectConditions.exists()).to.equal(true);
      expect(selectConditions.prop("data")).to.equal(data);
      expect(selectConditions.prop("path")).to.equal("/1");
      expect(selectConditions.prop("selectedCondition")).to.equal(undefined);
      expect(selectConditions.prop("conditionsChange")).to.equal(
        wrapper.instance().conditionSelected
      );
    });
  });

  describe("Editing a link which has a condition", () => {
    const data = new Data({
      pages: [
        {
          path: "/1",
          title: "Page 1",
          next: [{ path: "/2", condition: "anotherCondition" }],
        },
        { path: "/2", title: "Page 2" },
      ],
      conditions: [
        { name: "someCondition", displayName: "My condition" },
        { name: "anotherCondition", displayName: "Another condition" },
      ],
    });
    const edge = {
      source: "/1",
      target: "/2",
    };

    test("Renders a form with expected inputs", () => {
      const wrapper = shallow(<LinkEdit data={data} edge={edge} />);
      const form = wrapper.find("form");

      const fromInput = form.find("#link-source");
      assertSelectInput({
        wrapper: fromInput,
        id: "link-source",
        expectedFieldOptions: [
          { text: "" },
          { value: "/1", text: "Page 1" },
          { value: "/2", text: "Page 2" },
        ],
        expectedValue: "/1",
      });
      expect(fromInput.prop("disabled")).to.equal(true);

      const toInput = form.find("#link-target");
      assertSelectInput({
        wrapper: toInput,
        id: "link-target",
        expectedFieldOptions: [
          { text: "" },
          { value: "/1", text: "Page 1" },
          { value: "/2", text: "Page 2" },
        ],
        expectedValue: "/2",
      });
      expect(toInput.prop("disabled")).to.equal(true);

      const selectConditions = wrapper.find("SelectConditions");
      expect(selectConditions.exists()).to.equal(true);
      expect(selectConditions.prop("data")).to.equal(data);
      expect(selectConditions.prop("path")).to.equal("/1");
      expect(selectConditions.prop("selectedCondition")).to.equal(
        "anotherCondition"
      );
      expect(selectConditions.prop("conditionsChange")).to.equal(
        wrapper.instance().conditionSelected
      );
    });
  });

  describe("submitting the form", () => {
    const data = new Data({
      pages: [
        { path: "/1", title: "Page 1", next: [{ path: "/2" }] },
        { path: "/2", title: "Page 2" },
      ],
      conditions: [
        { name: "someCondition", displayName: "My condition" },
        { name: "anotherCondition", displayName: "Another condition" },
      ],
    });
    const edge = {
      source: "/1",
      target: "/2",
    };

    test("with a condition updates the link and calls back", async (flags) => {
      const clonedData = {
        updateLink: sinon.stub(),
      };
      const updatedData = sinon.spy();
      const savedData = sinon.spy();
      const onEdit = (data) => {
        expect(data.data).to.equal(savedData);
      };
      const save = (data) => {
        expect(data).to.equal(updatedData);
        return Promise.resolve(savedData);
      };
      const wrappedOnEdit = flags.mustCall(onEdit, 1);

      const DataWrapper = ({
        dataValue = { data, save: sinon.spy() },
        children,
      }) => {
        return (
          <DataContext.Provider value={dataValue}>
            {children}
          </DataContext.Provider>
        );
      };

      const wrapper = mount(
        <LinkEdit data={data} edge={edge} onEdit={wrappedOnEdit} />,
        { wrappingComponent: DataWrapper }
      );
      const selectedCondition = "aCondition";
      wrapper.instance().conditionSelected(selectedCondition);

      clonedData.updateLink.returns(updatedData);

      const preventDefault = sinon.spy();

      data.clone = sinon.stub();
      data.clone.returns(clonedData);

      await wrapper.simulate("submit", { preventDefault: preventDefault });

      expect(preventDefault.calledOnce).to.equal(true);
      expect(clonedData.updateLink.calledOnce).to.equal(true);
      expect(clonedData.updateLink.firstCall.args[0]).to.equal("/1");
      expect(clonedData.updateLink.firstCall.args[1]).to.equal("/2");
      expect(clonedData.updateLink.firstCall.args[2]).to.equal("aCondition");
    });
  });
});
