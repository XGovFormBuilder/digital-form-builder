import { customRenderForLists } from "./helpers";
import { initI18n } from "../../i18n";
import { Data } from "@xgovformbuilder/model";
import React from "react";
import { ListEdit } from "../listEdit";

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
  const listEditValue = {
    selectedList: data.findList("myList"),
    dispatch: jest.fn(),
  };

  const { getByText } = customRenderForLists(<ListEdit />, {
    dataValue,
    listEditValue,
  });

  expect(getByText("List items")).toBeInTheDocument();
  expect(
    getByText("Drag and drop the icons to reorder your list")
  ).toBeInTheDocument();
  expect(getByText("Add list item")).toBeInTheDocument();
});
