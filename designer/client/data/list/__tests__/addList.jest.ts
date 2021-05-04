import { FormDefinition } from "@xgovformbuilder/model";
import { addList } from "../addList";

const data: FormDefinition = {
  conditions: [],
  lists: [
    {
      name: "listA",
    },
    {
      name: "listB",
    },
  ],
  pages: [],
  sections: [],
};

test("findList throws when a list with the same name already exists", () => {
  expect(() =>
    addList(data, { name: "listA", title: "list a", items: [], type: "string" })
  ).toThrowError(/A list with the name/);
});

test("addList returns a tuple of the list and the index", () => {
  expect(
    addList(data, { name: "pokedex", title: "151", items: [], type: "number" })
      .lists
  ).toEqual([
    { name: "listA" },
    { name: "listB" },
    { items: [], name: "pokedex", title: "151", type: "number" },
  ]);
});
