import React from "react";
import { Visualisation } from "../Visualisation";
import { render, waitFor } from "@testing-library/react";
import { DataContext } from "../../../context";
import { Data } from "@xgovformbuilder/model";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";

const customRender = (ui, { providerProps, ...renderOptions }) => {
  const history = createMemoryHistory();
  history.push("");
  return render(
    <Router history={history}>
      <DataContext.Provider value={providerProps}>{ui}</DataContext.Provider>
    </Router>,
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
  data.addPage({
    title: "my third page",
    path: "/3",
  });
  rerender();
  await waitFor(() => queryAllByText("my third page"));
});
