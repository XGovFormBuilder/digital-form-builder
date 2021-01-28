import React from "react";
import { Visualisation } from "../Visualisation";
import { act, render, waitFor } from "@testing-library/react";
import { DataContext } from "../../../context";
import { Data } from "@xgovformbuilder/model";

const customRender = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <DataContext.Provider value={providerProps}>{ui}</DataContext.Provider>,
    renderOptions
  );
};

test("Graph is rendered with correct number of pages and updates ", async () => {
  const data = new Data({
    pages: [
      {
        title: "my first page",
        path: "/1",
      },
      { title: "my second page", path: "/2" },
    ],
  });
  const providerProps = {
    data,
    save: jest.fn(),
  };

  const {
    rerender,
    findAllByText,
    queryAllByText,
  } = customRender(<Visualisation />, { providerProps });
  expect(await findAllByText("my first page")).toBeTruthy();
  expect(await findAllByText("my second page")).toBeTruthy();
  const thirdPage = await queryAllByText("my third page");
  expect(thirdPage.length).toBe(0);
  data.addPage({
    title: "my third page",
    path: "/3",
  });
  rerender();
  await waitFor(() => queryAllByText("my third page"));
});
