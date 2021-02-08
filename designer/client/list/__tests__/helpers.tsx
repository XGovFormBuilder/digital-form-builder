import { render } from "@testing-library/react";
import { DataContext, FlyoutContext } from "../../context";
import React from "react";
import { ListContext } from "../../reducers/listReducer";
import {
  initListsEditingState,
  ListsEditorContext,
} from "../../reducers/list/listsEditorReducer";

const defaultFlyoutValue = {
  increment: jest.fn(),
  decrement: jest.fn(),
  count: 0,
};
const defaultDataValue = { data: {}, save: jest.fn() };
const defaultListsValue = {
  state: initListsEditingState(),
  dispatch: jest.fn(),
};
const defaultListValue = { state: {}, dispatch: jest.fn() };

export const customRenderForLists = (
  children,
  {
    dataValue = defaultDataValue,
    flyoutValue = defaultFlyoutValue,
    listsValue = defaultListsValue,
    listValue = defaultListValue,
    ...renderOptions
  }
) => {
  const rendered = render(
    <DataContext.Provider value={dataValue}>
      <FlyoutContext.Provider value={flyoutValue}>
        <ListsEditorContext.Provider value={listsValue}>
          <ListContext.Provider value={listValue}>
            {children}
          </ListContext.Provider>
        </ListsEditorContext.Provider>
      </FlyoutContext.Provider>
      <div id="portal-root" />
    </DataContext.Provider>,
    renderOptions
  );
  return {
    ...rendered,
    rerender: (ui, options) =>
      customRenderForLists(ui, { container: rendered.container, ...options }),
  };
};
