import { customRenderForLists } from "./helpers";
import { initI18n } from "../../i18n";
import { Data } from "@xgovformbuilder/model";
import React from "react";
import { ListEdit } from "../ListEdit";
import { ListContext } from "../../reducers/listReducer";

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
  const listValue = {
    state: { selectedList: data.findList("myList") },
    dispatch: jest.fn(),
  };
  let listsValue = {
    state: { listEditContext: ListContext },
    dispatch: jest.fn(),
  };

  const { getByText, rerender } = customRenderForLists(<ListEdit />, {
    dataValue,
    listsValue,
    listValue,
  });

  expect(getByText("List items")).toBeInTheDocument();
  expect(getByText("Enter a unique name for your list")).toBeInTheDocument();
  expect(
    getByText("Drag and drop the icons to reorder your list")
  ).toBeInTheDocument();
  expect(getByText("Add a new list item")).toBeInTheDocument();

  await rerender(<ListEdit />, {
    dataValue,
    listsValue,
    listValue: { state: { selectedList: { isNew: true } } },
  });
  expect(getByText("Cancel")).toBeInTheDocument();
});
