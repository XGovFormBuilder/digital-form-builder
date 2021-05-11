import { customRenderForLists } from "./helpers";
import { Data } from "@xgovformbuilder/model";

import React from "react";
import { ListSelect } from "../ListSelect";

const data = {
  lists: [
    {
      name: "myList",
      title: "My list",
      type: "number",
      items: [{ text: "An item", description: "A hint", value: 12 }],
    },
    {
      name: "myOtherList",
      title: "",
      type: "string",
      items: [{ text: "An item", description: "A hint", value: 12 }],
    },
  ],
};

test("Lists all available lists and add list", async () => {
  const dataValue = { data, save: jest.fn() };

  const { queryAllByTestId, getByTestId } = customRenderForLists(
    <ListSelect />,
    {
      dataValue,
    }
  );
  const editLinks = await queryAllByTestId("edit-list");
  expect(editLinks.length).toBe(2);
  expect(getByTestId("add-list")).toBeInTheDocument();
});

test("strings are rendered correctly", async () => {
  const dataValue = { data, save: jest.fn() };

  const { getByText } = customRenderForLists(<ListSelect />, {
    dataValue,
  });

  expect(
    getByText(
      "Use lists to provide information in bullet points or set answers to multiple choice questions. After you create a list you can assign it to components to use on your form."
    )
  ).toBeInTheDocument();
  expect(
    getByText(
      "Lists you have created appear on this screen. From here you can manage the lists available for your form."
    )
  ).toBeInTheDocument();
  expect(getByText("Add a new list")).toBeInTheDocument();
});
