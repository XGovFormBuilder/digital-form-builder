import sinon from "sinon";
import React from "react";
import { mount, shallow } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { DataContext } from "../client/context";
import { Data } from "@xgovformbuilder/model";
import { ComponentContext } from "../client/reducers/component/componentReducer";
import { ListsEditorContext } from "../client/reducers/list/listsEditorReducer";
import { ListContext } from "../client/reducers/listReducer";
import { ListEdit } from "../client/list/ListEdit";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { experiment, test, suite, beforeEach, afterEach } = lab;

experiment("List edit", () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  let data = new Data({
    pages: [
      {
        title: "First page",
        path: "/first-page",
        components: [
          {
            name: "IDDQl4",
            title: "abc",
            schema: {},
            options: {
              required: true,
            },
            type: "RadiosField",
            values: {
              type: "static",
              valueType: "string",
              items: [
                { label: "My item", value: "12", children: [] },
                {
                  label: "Item 2",
                  hint: "My hint",
                  value: "11",
                  condition: "Abcewdad",
                  children: [],
                },
              ],
            },
          },
        ],
      },
    ],
    lists: [
      {
        name: "myList",
        title: "My list",
        type: "number",
        items: [{ text: "An item", description: "A hint", value: 12 }],
      },
    ],
  });
  const dataValue = { data, save: sinon.spy() };

  beforeEach(() => {});

  suite("Global", () => {
    const TestProvider = ({ listsEditorValue, listContextValue, children }) => {
      return (
        <DataContext.Provider value={dataValue}>
          <ListsEditorContext.Provider value={listsEditorValue}>
            <ListContext.Provider value={listContextValue}>
              {children}
            </ListContext.Provider>
          </ListsEditorContext.Provider>
        </DataContext.Provider>
      );
    };

    test("allows title change", () => {
      const listsEditorState = {
        isEditingList: true,
        selectedList: {},
        listEditContext: ListContext,
      };
      const listContextState = data.findList("myList");

      wrapper = mount(
        <TestProvider
          listsEditorValue={{ state: listsEditorState, dispatch: sinon.spy() }}
          listContextValue={{ state: listContextState, dispatch: sinon.spy() }}
        >
          <ListEdit />
        </TestProvider>
      );
      expect(wrapper.find("input")).to.exist();
    });

    test("displays list items and edit/delete called correctly", () => {
      const listsEditorValue = {
        isEditingList: true,
        listEditContext: ListContext,
      };
      const sandbox = sinon.createSandbox();
      const selectedList = data.findList("myList");
      const listContextState = {
        selectedList,
      };
      wrapper = mount(
        <TestProvider
          listsEditorValue={{
            state: listsEditorValue,
            dispatch: sandbox.spy(),
          }}
          listContextValue={{
            state: listContextState,
            dispatch: sandbox.spy(),
          }}
        >
          <ListEdit />
        </TestProvider>
      );
      const listEdit = wrapper.find(ListEdit);
      const editLink = listEdit.find("tr a").get(0);
      const deleteLink = listEdit.find("tr a").get(1);
      expect(editLink.props.children).to.equal("Edit");
      expect(deleteLink.props.children).to.equal("Delete");

      const listSpy = sandbox.getFakes()[1];
      const editorSpy = sandbox.getFakes()[0];
      expect(listSpy.notCalled).to.be.true();
      expect(editorSpy.notCalled).to.be.true();

      const wrap = shallow(editLink);
      wrap.simulate("click");
      expect(editorSpy.firstCall.firstArg).to.equal([
        "IS_EDITING_LIST_ITEM",
        true,
      ]);
      expect(listSpy.firstCall.firstArg).to.equal({
        type: "EDIT_LIST_ITEM",
        payload: {
          text: "An item",
          description: "A hint",
          value: 12,
        },
      });
    });
  });

  suite("Static", () => {
    let sandbox = sinon.createSandbox();
    const TestProvider = ({
      listsEditorValue,
      listContextValue,
      componentValue,
      children,
    }) => {
      return (
        <DataContext.Provider value={dataValue}>
          <ListsEditorContext.Provider value={listsEditorValue}>
            <ListContext.Provider value={listContextValue}>
              <ComponentContext.Provider value={componentValue}>
                {children}
              </ComponentContext.Provider>
            </ListContext.Provider>
          </ListsEditorContext.Provider>
        </DataContext.Provider>
      );
    };

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    test("do not have input", () => {
      const listsEditorValue = {
        isEditingList: true,
        isEditingStatic: true,
        listEditContext: ComponentContext,
      };

      const componentContextValue = {
        selectedComponent: data.pages[0].components[0],
      };

      wrapper = mount(
        <TestProvider
          listsEditorValue={{
            state: listsEditorValue,
            dispatch: sandbox.spy(),
          }}
          listContextValue={{ state: {}, dispatch: sandbox.spy() }}
          componentValue={{
            state: componentContextValue,
            dispatch: sandbox.spy(),
          }}
        >
          <ListEdit />
        </TestProvider>
      );
      expect(wrapper.find("input").exists()).to.equal(false);
    });

    test("displays list items and edit/delete called correctly", () => {
      const listsEditorValue = {
        state: {
          isEditingList: true,
          isEditingStatic: true,
          listEditContext: ComponentContext,
        },
        dispatch: sandbox.spy(),
      };

      const componentContextValue = {
        state: {
          selectedComponent: data.pages[0].components[0],
        },
        dispatch: sandbox.spy(),
      };

      wrapper = mount(
        <TestProvider
          listsEditorValue={listsEditorValue}
          listContextValue={{ state: {}, dispatch: sandbox.spy() }}
          componentValue={componentContextValue}
        >
          <ListEdit />
        </TestProvider>
      );

      const listEdit = wrapper.find(ListEdit);
      const editLink = listEdit.find("tr a").get(0);
      const deleteLink = listEdit.find("tr a").get(1);
      expect(editLink.props.children).to.equal("Edit");
      expect(deleteLink.props.children).to.equal("Delete");

      const componentSpy = sandbox.getFakes()[1];
      const editorSpy = sandbox.getFakes()[0];
      expect(componentSpy.notCalled).to.be.true();
      expect(editorSpy.notCalled).to.be.true();

      const wrap = shallow(editLink);
      wrap.simulate("click");
      expect(editorSpy.firstCall.firstArg).to.equal([
        "IS_EDITING_LIST_ITEM",
        true,
      ]);
      expect(componentSpy.firstCall.firstArg).to.equal({
        type: "EDIT_LIST_ITEM",
        payload: {
          label: "My item",
          value: "12",
          children: [],
        },
      });
    });
  });
});
