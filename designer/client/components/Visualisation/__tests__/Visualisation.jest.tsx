import React from "react";
import { Visualisation } from "../Visualisation";
import { render, waitFor } from "@testing-library/react";
import { DataContext } from "../../../context";
import { Data } from "@xgovformbuilder/model";
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
