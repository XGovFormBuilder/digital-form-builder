import { customRenderForLists } from "./helpers";
import { initI18n } from "../../i18n";
import { Data } from "@xgovformbuilder/model";
import React from "react";
import { ListItemEdit } from "../ListItemEdit";

initI18n();

const data = new Data({
  pages: [],
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
});

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
