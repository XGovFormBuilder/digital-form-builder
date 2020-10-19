import React from "react";
import { shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";
import { Data } from "@xgovformbuilder/model";
import ListsEdit from "../client/lists-edit";

import sinon from "sinon";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { suite, test, describe } = lab;

function assertSingleLink(listItem, listText) {
  const links = listItem.children("a");
  expect(links.exists()).to.equal(true);
  expect(links.length).to.equal(1);
  expect(links.at(0).text()).to.equal(listText);
  return links;
}

suite("Lists edit", () => {
  const generatedId = "dqdiwjOA";

  describe("When there are no lists", () => {
    const data = new Data({
      lists: [],
    });
    data.getId = sinon.stub();
    data.getId.resolves(generatedId);

    test("Renders the add list link", () => {
      const wrapper = shallow(<ListsEdit data={data} />);
      const list = wrapper.find("ul");
      expect(list.exists()).to.equal(true);
      const listItems = list.children("li");
      expect(listItems.exists()).to.equal(true);
      expect(listItems.length).to.equal(1);
      assertSingleLink(listItems.at(0), "Add list");
    });

    test("Clicking the add list link displays the ListEditView", async () => {
      const wrapper = shallow(<ListsEdit data={data} />);
      await wrapper
        .find("a")
        .simulate("click", { preventDefault: sinon.stub() });
      const list = wrapper.find("ul");
      expect(list.exists()).to.equal(false);
      const listEdit = wrapper.find("ListEdit");
      expect(listEdit.exists()).to.equal(true);
      expect(listEdit.prop("id")).to.equal(generatedId);
      expect(listEdit.prop("data")).to.equal(data);
    });
  });

  describe("When there are existing lists", () => {
    const data = new Data({
      lists: [
        { name: "DJdmxSLknx", title: "My list" },
        { name: "QSDONwanw", title: "Another list" },
      ],
    });
    data.getId = sinon.stub();
    data.getId.resolves(generatedId);

    test("Renders each list as a link as well as the add list link", () => {
      const wrapper = shallow(<ListsEdit data={data} />);
      const list = wrapper.find("ul");
      expect(list.exists()).to.equal(true);
      const listItems = list.children("li");
      expect(listItems.exists()).to.equal(true);
      expect(listItems.length).to.equal(3);

      assertSingleLink(listItems.at(0), "My list");
      assertSingleLink(listItems.at(1), "Another list");
      assertSingleLink(listItems.at(2), "Add list");
    });

    test("Clicking the add list link displays the appropriate ListEditView", async () => {
      const wrapper = shallow(<ListsEdit data={data} />);
      await wrapper
        .find("a")
        .at(2)
        .simulate("click", { preventDefault: sinon.stub() });
      const list = wrapper.find("ul");
      expect(list.exists()).to.equal(false);
      const listEdit = wrapper.find("ListEdit");
      expect(listEdit.exists()).to.equal(true);
      expect(listEdit.prop("id")).to.equal(generatedId);
      expect(listEdit.prop("data")).to.equal(data);
    });

    test("Clicking an existing list link displays the appropriate edit view", async () => {
      const wrapper = shallow(<ListsEdit data={data} />);
      await wrapper
        .find("a")
        .at(1)
        .simulate("click", { preventDefault: sinon.stub() });
      const list = wrapper.find("ul");
      expect(list.exists()).to.equal(false);
      const listEdit = wrapper.find("ListEdit");
      expect(listEdit.exists()).to.equal(true);
      expect(listEdit.prop("list")).to.equal(data.lists[1]);
      expect(listEdit.prop("data")).to.equal(data);
    });
  });
});
