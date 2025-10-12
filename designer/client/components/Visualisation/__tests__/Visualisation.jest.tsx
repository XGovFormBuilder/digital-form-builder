import React from "react";
import { Visualisation } from "../Visualisation";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { DataContext } from "../../../context";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

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

test("Graph is rendered with correct number of pages and updates ", async () => {
  const data = {
    pages: [
      {
        title: "my first page",
        path: "/1",
      },
      { title: "my second page", path: "/2" },
    ],
  };
  const providerProps = {
    data,
    save: jest.fn(),
  };

  const { rerender, findAllByText, queryAllByText } = customRender(
    <Visualisation previewUrl={"http://localhost:3000"} id={"aa"} />,
    {
      providerProps,
    }
  );
  expect(await findAllByText("my first page")).toBeTruthy();
  expect(await findAllByText("my second page")).toBeTruthy();
  const thirdPage = await queryAllByText("my third page");
  expect(thirdPage.length).toBe(0);

  const newPage = {
    title: "my third page",
    path: "/3",
  };

  await rerender(
    <Visualisation previewUrl={"http://localhost:3000"} id={"aa"} />,
    {
      providerProps: {
        data: { ...data, pages: [...data.pages, newPage] },
        save: jest.fn(),
      },
    }
  );

  await waitFor(() => expect(queryAllByText("my third page").length).toBe(2));
});

test("Links between pages are navigable via keyboard", async () => {
  const data = {
    pages: [
      {
        title: "link source",
        path: "/link-source",
        next: [{ path: "/link-target" }],
      },
      { title: "link target", path: "/link-target" },
    ],
    conditions: [],
  };
  const providerProps = {
    data,
    save: jest.fn(),
  };

  const { queryByTestId, queryAllByText, getByText } = customRender(
    <Visualisation previewUrl={"http://localhost:3000"} id={"aa"} />,
    {
      providerProps,
    }
  );
  // Check link exists and has the expected label
  const link = await queryAllByText(
    "Edit link from link-source to link-target"
  )?.[0];
  expect(link).toBeTruthy();

  // Check that link works when selected with the enter key
  expect(queryByTestId("flyout-0")).toBeNull();

  fireEvent.keyPress(link, {
    key: "Enter",
    code: "Enter",
    charCode: 13,
  });

  expect(queryByTestId("flyout-0")).toBeInTheDocument();

  fireEvent.click(getByText("Close"));

  // Check that link works when selected with the space key
  expect(queryByTestId("flyout-0")).toBeNull();

  fireEvent.keyPress(link, {
    key: " ",
    code: "Space",
    charCode: 32,
  });

  expect(queryByTestId("flyout-0")).toBeInTheDocument();
});

test("Minimap Navigation", async () => {
  const data = {
    pages: [
      {
        title: "link source",
        path: "/link-source",
        next: [{ path: "/link-target" }],
      },
      { title: "link target", path: "/link-target" },
    ],
    conditions: [],
  };
  const providerProps = {
    data,
    save: jest.fn(),
  };

  const { getByTestId, queryByTestId } = customRender(
    <Visualisation previewUrl={"http://localhost:3000"} id={"aa"} />,
    {
      providerProps,
    }
  );

  fireEvent.click(getByTestId("/link-target1"));
  // @ts-ignore
  expect(queryByTestId("/link-target").className).toBe("page page--selected");
});
