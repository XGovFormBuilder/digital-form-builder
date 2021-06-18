import { customRenderForLists } from "./helpers";
import { Data } from "@xgovformbuilder/model";
import React from "react";
import { ListEdit } from "../ListEdit";
import { ListContext } from "../../reducers/listReducer";

const data = {
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
    {
      name: "myEmptyList",
      title: "My empty list",
      items: [],
    },
  ],
};

test("strings are rendered correctly", async () => {
  const dataValue = { data, save: jest.fn() };
  const listValue = {
    state: { selectedList: data.lists[0] },
    dispatch: jest.fn(),
  };
  let listsValue = {
    state: { listEditContext: ListContext },
    dispatch: jest.fn(),
  };

  const { getByText, queryByText, rerender } = customRenderForLists(
    <ListEdit />,
    {
      dataValue,
      listsValue,
      listValue,
    }
  );

  expect(getByText("List items")).toBeInTheDocument();
  expect(getByText("Enter a unique name for your list")).toBeInTheDocument();
  expect(
    getByText("Use the drag handles to reorder your list")
  ).toBeInTheDocument();
  expect(getByText("Add list item")).toBeInTheDocument();
  expect(queryByText("This list does not have any list items")).toBeNull();

  const emptyList = {
    state: { selectedList: data.lists[1], isNew: true },
    dispatch: jest.fn(),
  };

  await rerender(<ListEdit />, {
    dataValue,
    listsValue,
    listValue: emptyList,
  });
  expect(
    getByText("This list does not have any list items")
  ).toBeInTheDocument();
});
