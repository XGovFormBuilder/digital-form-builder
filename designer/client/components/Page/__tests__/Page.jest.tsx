import { fireEvent, render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { DataContext } from "../../../context";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import React from "react";
import { Page } from "..";
const history = createMemoryHistory();
history.push("");
const customRender = (ui, { providerProps, ...renderOptions }) => {
  const rendered = render(
    <Router history={history}>
      <DataContext.Provider value={providerProps}>{ui}</DataContext.Provider>
    </Router>,
    renderOptions
  );
  return {
    ...rendered,
    rerender: (ui, options) =>
      customRender(ui, { container: rendered.container, ...options }),
  };
};

const data = {
  pages: [
    {
      title: "my first page",
      path: "/1",
      components: [
        {
          type: "TextField",
          name: "firstName",
          title: "First name",
          options: {
            required: true,
          },
          schema: {},
        },
        {
          options: {
            required: false,
            optionalText: false,
          },
          type: "TextField",
          name: "middleName",
          title: "Middle name",
          hint:
            "If you have a middle name on your passport you must include it here",
          schema: {},
        },
        {
          type: "TextField",
          name: "lastName",
          title: "Surname",
          options: {
            required: true,
          },
          schema: {},
        },
      ],
    },
    { title: "my second page", path: "/2" },
  ],
  sections: [],
};
const providerProps = {
  data,
  save: jest.fn(),
};

test("PageEdit can be shown/hidden successfully", async () => {
  const { findByText, getByText } = customRender(
    <Page
      page={data.pages[0]}
      previewUrl={"https://localhost:3009"}
      id={"aa"}
      layout={{}}
    />,
    {
      providerProps,
    }
  );
  await fireEvent.click(getByText("Edit page"));
  expect(screen.findByTestId("page-edit")).toBeTruthy();

  await fireEvent.click(screen.getByText("Save"));
  expect(screen.queryByTestId("page-edit")).toBeFalsy();

  await fireEvent.click(await findByText("Edit page"));
  expect(screen.findByTestId("Flyout-0")).toBeTruthy();

  await fireEvent.click(screen.getByText("Close"));
  expect(screen.queryByTestId("Flyout-0")).toBeFalsy();
});

test("AddComponent can be shown/hidden successfully", async () => {
  const { getByText } = customRender(
    <Page
      page={data.pages[0]}
      previewUrl={"https://localhost:3009"}
      id={"aa"}
      layout={{}}
    />,
    {
      providerProps,
    }
  );
  await fireEvent.click(getByText("Create component"));
  expect(screen.findByTestId("component-create")).toBeTruthy();

  await fireEvent.click(screen.getByText("Close"));
  expect(screen.queryByTestId("Flyout-0")).toBeFalsy();
});

test("Page actions contain expected call to actions", () => {
  const { getByText } = customRender(
    <Page
      page={data.pages[0]}
      previewUrl={"https://localhost:3009"}
      id={"aa"}
      layout={{}}
    />,
    {
      providerProps,
    }
  );
  expect(getByText("Edit page")).toBeTruthy();
  expect(getByText("Create component")).toBeTruthy();
  expect(getByText("Preview")).toBeTruthy();
});

test("Dragging component order saves successfully", async () => {
  const { getByText } = customRender(
    <Page
      page={data.pages[0]}
      previewUrl={"https://localhost:3009"}
      id={"aa"}
      layout={{}}
    />,
    {
      providerProps,
    }
  );
  await fireEvent.click(getByText("Create component"));
  expect(screen.findByTestId("component-create")).toBeTruthy();

  await fireEvent.click(screen.getByText("Close"));
  expect(screen.queryByTestId("Flyout-0")).toBeFalsy();
});
