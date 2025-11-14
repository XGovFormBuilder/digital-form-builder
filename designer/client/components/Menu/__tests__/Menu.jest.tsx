import { Menu } from "..";
import { screen } from "@testing-library/dom";
import { render, fireEvent } from "@testing-library/react";
import { DataContext, FlyoutContext } from "../../../context";
import React from "react";

const rawData = {
  lists: [],
  pages: [
    {
      title: "First page",
      path: "/first-page",
      components: [],
    },
    {
      title: "Summary",
      path: "/summary",
      components: [],
    },
  ],
  sections: [],
  startPage: "",
  conditions: [],
};

const data = { ...rawData };
const dataValue = { data, save: jest.fn() };
const flyoutValue = {
  increment: jest.fn(),
  decrement: jest.fn(),
  count: 1,
};

export const customRender = (children) => {
  return render(
    <DataContext.Provider value={dataValue}>
      <FlyoutContext.Provider value={flyoutValue}>
        {children}
      </FlyoutContext.Provider>
      <div id="portal-root" />
    </DataContext.Provider>
  );
};

it("Renders button strings correctly", () => {
  const { getByText } = customRender(<Menu />);

  expect(getByText("Form details")).toBeInTheDocument();
  expect(getByText("Add page")).toBeInTheDocument();
  expect(getByText("Add link")).toBeInTheDocument();
  expect(getByText("Sections")).toBeInTheDocument();
  expect(getByText("Conditions")).toBeInTheDocument();
  expect(getByText("Lists")).toBeInTheDocument();
  expect(getByText("Outputs")).toBeInTheDocument();
  expect(getByText("Fees")).toBeInTheDocument();
  expect(getByText("Summary")).toBeInTheDocument();
});

it("Can open flyouts and close them", () => {
  const { getByText, queryByTestId } = customRender(<Menu />);
  expect(queryByTestId("flyout-1")).toBeNull();
  fireEvent.click(getByText("Form details"));
  expect(queryByTestId("flyout-1")).toBeInTheDocument();
  fireEvent.click(getByText("Close"));
  expect(queryByTestId("flyout-1")).toBeNull();
});

it("clicking on a summary tab shows different tab content", () => {
  const { getByTestId, queryByTestId } = customRender(<Menu />);
  fireEvent.click(getByTestId("menu-summary"));
  expect(getByTestId("flyout-1")).toBeInTheDocument();
  expect(queryByTestId("tab-json")).toBeNull();
  expect(queryByTestId("tab-summary")).toBeNull();
  fireEvent.click(getByTestId("tab-json-button"));
  expect(getByTestId("tab-json")).toBeInTheDocument();
  expect(queryByTestId("tab-summary")).toBeNull();
  expect(queryByTestId("tab-model")).toBeNull();
});

it("flyouts close on Save", async () => {
  const { getByText, queryByTestId, getByTestId } = customRender(<Menu />);

  fireEvent.click(getByText("Add link"));
  expect(queryByTestId("flyout-1")).toBeInTheDocument();

  fireEvent.change(getByTestId("link-source"), {
    target: { value: "/summary" },
  });

  fireEvent.change(getByTestId("link-target"), {
    target: { value: "/first-page" },
  });

  await fireEvent.click(getByText("Save"));
  expect(dataValue.save).toHaveBeenCalledTimes(1);
  expect(queryByTestId("flyout-1")).toBeNull();
});
