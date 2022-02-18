import React from "react";
import { render, fireEvent } from "@testing-library/react";
import LinkCreate from "../link-create";
import { DataContext } from "../context";
import { screen, within } from "@testing-library/dom";

const rawData = {
  lists: [],
  pages: [
    {
      title: "First page",
      path: "/first-page",
      components: [
        {
          type: "YesNoField",
          name: "ukPassport",
          title: "Do you have a UK passport?",
          option: {
            required: true,
          },
          schema: {},
        },
      ],
    },
    {
      title: "Second page",
      path: "/second-page",
      components: [],
    },
    {
      title: "Summary",
      path: "/summary",
      controller: "./pages/summary.js",
      components: [],
    },
  ],
  sections: [],
  startPage: "",
  conditions: [],
};

const data = { ...rawData };
const dataValue = {
  data,
  save: jest.fn(),
};
export const customRender = (children, providerProps = dataValue) => {
  return render(
    <DataContext.Provider value={providerProps}>
      {children}
      <div id="portal-root" />
    </DataContext.Provider>
  );
};

test("hint texts are rendered correctly", () => {
  const hint1 =
    "You can add links between different pages and set conditions for links to control the page that loads next. For example, a question page with a component for yes and no options could have link conditions based on which option a user selects.";
  const hint2 =
    "To add a link in the main screen, click and hold the title of a page and drag a line to the title of the page you want to link it to. To edit a link, select its line.";

  const { getByText } = customRender(<LinkCreate />);
  expect(getByText(hint1)).toBeInTheDocument();
  expect(getByText(hint2)).toBeInTheDocument();
});

test("cannot add condition hint is rendered correctly", () => {
  const hint =
    "You cannot add any conditions as there are no components on the page you wish to link from. Add a component, such as an Input or a Selection field, and then add a condition.";

  const { getByLabelText, getByText } = customRender(<LinkCreate />);

  fireEvent.change(getByLabelText("From"), {
    target: { value: data.pages[1].path },
  });

  expect(getByText(hint)).toBeInTheDocument();
});

test("Renders from and to inputs with the correct options", () => {
  customRender(<LinkCreate />);
  const fromInput = within(screen.getByTestId("link-source"));
  const toInput = within(screen.getByTestId("link-target"));
  expect(fromInput.getByText(data.pages[0].title)).toBeInTheDocument();
  expect(fromInput.getByText(data.pages[1].title)).toBeInTheDocument();
  expect(toInput.getByText(data.pages[0].title)).toBeInTheDocument();
  expect(toInput.getByText(data.pages[1].title)).toBeInTheDocument();
});

test("Selecting a from value causes the SelectConditions component to be displayed", () => {
  const { getByTestId, queryByTestId } = customRender(<LinkCreate />);
  expect(queryByTestId("select-conditions")).toBeNull();
  fireEvent.change(getByTestId("link-source"), {
    target: { value: "/first-page" },
  });
  expect(getByTestId("select-conditions")).toBeInTheDocument();
});

test("links for older conditions are correctly generated when the form is submitted", () => {
  const data = {
    ...rawData,
    conditions: [
      {
        name: "hasUKPassport",
        displayName: "hasUKPassport",
        value: "checkBeforeYouStart.ukPassport==true",
      },
      {
        name: "doesntHaveUKPassport",
        displayName: "doesntHaveUKPassport",
        value: "checkBeforeYouStart.ukPassport==false",
      },
    ],
  };
  const save = jest.fn();
  const { getByTestId, getByRole } = customRender(<LinkCreate />, {
    data,
    save,
  });
  fireEvent.change(getByTestId("link-source"), {
    target: { value: "/first-page" },
  });
  fireEvent.change(getByTestId("link-target"), {
    target: { value: "/summary" },
  });
  fireEvent.change(getByTestId("select-condition"), {
    target: { value: "hasUKPassport" },
  });
  fireEvent.click(getByRole("button"));
  expect(save).toBeCalledTimes(1);
  expect(save.mock.calls[0][0].pages[0].next).toContainEqual({
    path: "/summary",
    condition: "hasUKPassport",
  });

  fireEvent.change(getByTestId("link-source"), {
    target: { value: "/summary" },
  });
  fireEvent.change(getByTestId("link-target"), {
    target: { value: "/first-page" },
  });
  fireEvent.change(getByTestId("select-condition"), {
    target: { value: "" },
  });
  fireEvent.click(getByRole("button"));
  expect(save).toBeCalledTimes(2);

  expect(save.mock.calls[1][0].pages[2].next).toContainEqual({
    path: "/first-page",
  });
});

test("links are correctly generated when the form is submitted", () => {
  const data = {
    ...rawData,
    conditions: [
      {
        name: "hasUKPassport",
        displayName: "hasUKPassport",
        value: {
          name: "hasUKPassport",
          conditions: [
            {
              field: {
                name: "ukPassport",
                type: "YesNoField",
                display: "Do you have a UK passport?",
              },
              operator: "is",
              value: {
                type: "Value",
                value: "yes",
                display: "Yes, I have a UK passport",
              },
            },
          ],
        },
      },
      {
        name: "doesntHaveUKPassport",
        displayName: "doesntHaveUKPassport",
        value: {
          name: "doesntHaveUKPassport",
          conditions: [
            {
              field: {
                name: "ukPassport",
                type: "YesNoField",
                display: "Do you have a UK passport?",
              },
              operator: "is",
              value: {
                type: "Value",
                value: "no",
                display: "No, I do not have a UK passport",
              },
            },
          ],
        },
      },
    ],
  };
  const save = jest.fn();
  const { getByTestId, getByRole } = customRender(<LinkCreate />, {
    data,
    save,
  });
  fireEvent.change(getByTestId("link-source"), {
    target: { value: "/first-page" },
  });
  fireEvent.change(getByTestId("link-target"), {
    target: { value: "/summary" },
  });
  fireEvent.change(getByTestId("select-condition"), {
    target: { value: "hasUKPassport" },
  });
  fireEvent.click(getByRole("button"));
  expect(save).toBeCalledTimes(1);
  expect(save.mock.calls[0][0].pages[0].next).toContainEqual({
    path: "/summary",
    condition: "hasUKPassport",
  });

  fireEvent.change(getByTestId("link-source"), {
    target: { value: "/summary" },
  });
  fireEvent.change(getByTestId("link-target"), {
    target: { value: "/first-page" },
  });
  fireEvent.change(getByTestId("select-condition"), {
    target: { value: "hasUKPassport" },
  });
  fireEvent.click(getByRole("button"));
  expect(save).toBeCalledTimes(2);

  expect(save.mock.calls[1][0].pages[2].next).toContainEqual({
    path: "/first-page",
  });
});

test("Submitting without selecting to/from options shows the user an error", () => {
  const data = {
    ...rawData,
  };
  const save = jest.fn();
  const { getByRole } = customRender(<LinkCreate />, {
    data,
    save,
  });
  fireEvent.click(getByRole("button"));
  expect(save).not.toBeCalled();
  const summary = within(getByRole("alert"));
  expect(summary.getByText("Enter from")).toBeInTheDocument();
  expect(summary.getByText("Enter to")).toBeInTheDocument();
});
