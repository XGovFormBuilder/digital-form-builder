import { customRenderForLists } from "./helpers";
import React from "react";
import { ListItemEdit } from "../ListItemEdit";
import { fireEvent } from "@testing-library/react";

const data = {
  pages: [
    {
      title: "start",
      path: "/start",
      components: [
        {
          name: "text",
          title: "text",
          schema: {},
          options: {
            required: true,
          },
          type: "TextField",
        },
      ],
      next: [
        {
          path: "/first-page",
        },
      ],
    },
    {
      title: "First page",
      path: "/first-page",
      components: [
        {
          name: "IDDQl4",
          title: "abc",
          schema: {},
          options: {
            required: true,
          },
          type: "",
          list: "myList",
        },
      ],
    },
  ],
  sections: [],
  startPage: "",
  lists: [
    {
      name: "myList",
      title: "My list",
      items: [
        { text: "text a", description: "desc a", value: "value a" },
        { text: "text b", description: "desc b", value: "value b" },
      ],
    },
  ],
  conditions: [
    {
      displayName: "my condition",
      name: "MYWwRN",
      value: {
        name: "name",
        conditions: [
          {
            field: {
              name: "text",
              type: "TextField",
              display: "text",
            },
            operator: "is",
            value: {
              type: "Value",
              value: "hello",
              display: "hello",
            },
          },
        ],
      },
    },
  ],
};

test("strings are rendered correctly", async () => {
  const dataValue = { data, save: jest.fn() };

  const { getByText } = customRenderForLists(<ListItemEdit />, {
    dataValue,
  });

  expect(getByText("Item text")).toBeInTheDocument();
  expect(getByText("Enter the text you want to show")).toBeInTheDocument();
  expect(
    getByText(
      "This determines the data format of the list item and does not show on the form. Unless you are using integrations and want to modify the payload, it should match the list item text."
    )
  ).toBeInTheDocument();
  expect(
    getByText(
      "Select a condition that determines whether to show this list item. You can create and edit conditions on the Conditions screen."
    )
  ).toBeInTheDocument();
});

test("Condition selection works correctly", () => {
  const dataValue = { data, save: jest.fn() };

  const { getByTestId, getAllByTestId } = customRenderForLists(
    <ListItemEdit />,
    {
      dataValue,
    }
  );
  let options: HTMLOptionElement[] = getAllByTestId("list-condition-option");
  expect(options[0].selected).toBeTruthy();
  expect(options[1].selected).toBeFalsy();
  fireEvent.change(getByTestId("list-condition-select"), {
    target: { value: "MYWwRN" },
  });

  expect(options[0].selected).toBeFalsy();
  expect(options[1].selected).toBeTruthy();
  expect(options[1].textContent).toBe("my condition");
});
