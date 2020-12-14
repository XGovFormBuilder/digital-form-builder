import sinon from "sinon";
import React, { useReducer } from "react";
import { mount } from "enzyme";
import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { DataContext } from "../client/context";
import { Data } from "@xgovformbuilder/model";
import {
  initListsEditingState,
  ListsEditorContext,
  listsEditorReducer,
} from "../client/reducers/list/listsEditorReducer";
import { ListsEdit } from "../client/list/lists-edit";
import { ListContextProvider } from "../client/reducers/listReducer";
import { GlobalListSelect } from "../client/list/global-list-select";
import { ListEdit } from "../client/list/list-edit-fn";
import { ListItemEdit } from "../client/list/list-item-edit";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, suite } = lab;

suite("Lists (global)", () => {
  const sandbox = sinon.createSandbox();
  const i18n = sinon.stub().returns("mockTranslation");
  const data = new Data({
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
  let spied;

  const TestComponentContextProvider = ({ children, dataValue }) => {
    const [state, dispatch] = useReducer(
      listsEditorReducer,
      initListsEditingState()
    );
    spied = sandbox.spy(dispatch);
    return (
      <DataContext.Provider value={dataValue}>
        <ListsEditorContext.Provider value={[state, spied]}>
          <ListContextProvider>{children}</ListContextProvider>
        </ListsEditorContext.Provider>
      </DataContext.Provider>
    );
  };

  test("GlobalListSelect shows when not editing from component", () => {
    const wrapper = mount(
      <TestComponentContextProvider dataValue={dataValue}>
        <ListsEdit i18n={i18n} isEditingFromComponent={false} />
      </TestComponentContextProvider>
    );

    expect(
      wrapper.find(GlobalListSelect).first().isEmptyRender()
    ).to.be.false();
  });

  test("Opens correct editors", () => {
    const wrapper = mount(
      <TestComponentContextProvider dataValue={dataValue}>
        <ListsEdit i18n={i18n} />
      </TestComponentContextProvider>
    );
    const listsEdit = () => wrapper.find(ListsEdit).first();
    const globalListSelect = () => listsEdit().find(GlobalListSelect).first();
    const listEdit = () => listsEdit().find(ListEdit).first();
    const itemEdit = () => listsEdit().find(ListItemEdit).first();

    expect(globalListSelect().isEmptyRender()).to.be.false();

    listsEdit().find("ul a").first().simulate("click");
    expect(globalListSelect().isEmptyRender()).to.be.false();
    expect(listEdit().isEmptyRender()).to.be.false();
    expect(itemEdit().exists()).to.be.false();

    listEdit().find({ children: "Edit" }).first().simulate("click");
    expect(globalListSelect().isEmptyRender()).to.be.false();
    expect(listEdit().isEmptyRender()).to.be.false();
    expect(itemEdit().isEmptyRender()).to.be.false();
  });
});
