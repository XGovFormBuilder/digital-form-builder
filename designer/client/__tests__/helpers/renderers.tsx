import React, { useReducer } from "react";
import {
  ComponentContext,
  componentReducer,
  initComponentState,
} from "../../reducers/component/componentReducer";
import { DataContext } from "../../context";

export function RenderWithContext({ children, stateProps = {} }) {
  const [state, dispatch] = useReducer(
    componentReducer,
    initComponentState({
      ...stateProps,
    })
  );
  return (
    <ComponentContext.Provider value={{ state, dispatch }}>
      {children}
    </ComponentContext.Provider>
  );
}

export function RenderWithContextAndDataContext({
  children,
  stateProps = {},
  mockData = {},
}) {
  const [state, dispatch] = useReducer(
    componentReducer,
    initComponentState({
      ...stateProps,
    })
  );

  return (
    <DataContext.Provider value={{ data: mockData, save: jest.fn() }}>
      <ComponentContext.Provider value={{ state, dispatch }}>
        {children}
      </ComponentContext.Provider>
    </DataContext.Provider>
  );
}
