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

test("Alerts user when navigating backwards and does not go backwards when cancel is clicked", () => {
  const mockAddEventListener = jest.fn();
  window.addEventListener = mockAddEventListener;
  const pushStateSpy = jest.spyOn(window.history, "pushState");
  const goMock = jest.spyOn(window.history, "go");
  goMock.mockImplementation(jest.fn());
  const confirmSpy = jest.spyOn(window, "confirm");
  window.location = {
    ...window.location,
    replace: jest.fn(),
  };

  const providerProps = {
    data: new Data({
      pages: [{ title: "my first page", path: "/1" }],
    }),
    save: jest.fn(),
  };
  customRender(<Visualisation />, { providerProps });

  expect(goMock).toBeCalledTimes(0);
  expect(pushStateSpy).toBeCalledTimes(1);
  const [, popStateListener] = mockAddEventListener.mock.calls.find(
    (call) => call[0] === "popstate"
  );
  expect(popStateListener.name).toBe("alertUser");
  confirmSpy.mockImplementation(jest.fn(() => true)); // clicks continue
  popStateListener();
  expect(goMock).toBeCalledTimes(1);
  act(() => {
    confirmSpy.mockImplementation(jest.fn(() => false)); // clicks cancel
    popStateListener();
    popStateListener();
    popStateListener();
    expect(confirmSpy).toBeCalledTimes(4);
    expect(goMock).toBeCalledTimes(1);
  });
});
