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
import { ListContextProvider } from "../client/reducers/listReducer";
import { GlobalListSelect } from "../client/list/global-list-select";

const { expect } = Code;
const lab = Lab.script();
exports.lab = lab;
const { test, suite, afterEach } = lab;

suite("GlobalListSelect", () => {
  const i18n = sinon.stub().returns("mockTranslation");
  let wrapper;
  afterEach(() => {
    wrapper?.unmount();
  });
  const data = new Data({
    lists: [
      {
        name: "myList",
        title: "My list",
        type: "number",
        items: [{ text: "An item", description: "A hint", value: 12 }],
      },
      {
        name: "myOtherList",
        title: "",
        type: "string",
        items: [{ text: "An item", description: "A hint", value: 12 }],
      },
    ],
  });
  const dataValue = { data, save: sinon.spy() };

  const TestComponentContextProvider = ({ children, dataValue }) => {
    const [state, dispatch] = useReducer(
      listsEditorReducer,
      initListsEditingState()
    );
    return (
      <DataContext.Provider value={dataValue}>
        <ListsEditorContext.Provider value={[state, dispatch]}>
          <ListContextProvider>{children}</ListContextProvider>
        </ListsEditorContext.Provider>
      </DataContext.Provider>
    );
  };

  test("Lists all available lists", () => {
    wrapper = mount(
      <TestComponentContextProvider dataValue={dataValue}>
        <GlobalListSelect i18n={i18n} />
      </TestComponentContextProvider>
    );
    const lists = wrapper.find("li");
    expect(lists.length).to.equal(data.lists.length + 1);
    expect(lists.find("li a").get(0).props.children).to.equal("My list");
    expect(lists.find("li a").get(1).props.children).to.equal("myOtherList");
    expect(lists.find("li a").get(2).props.children).to.equal(
      "mockTranslation"
    );
  });
});
