import { FormDefinition } from "@xgovformbuilder/model";
import { updateLink } from "..";

const data: FormDefinition = {
  pages: [
    {
      path: "/1",
      next: [{ path: "/2", condition: "badgers" }],
      components: [{ name: "name1" }, { name: "name2" }],
    },
    {
      path: "/2",
      components: [{ name: "name3" }, { name: "name4" }],
    },
    {
      path: "/3",
    },
  ],
  conditions: [{ name: "badgers" }, { name: "isKangaroo" }],
};

test("updateLink throws if from, to, or there is no existing link", () => {
  expect(() => updateLink(data, "/1", "/3")).toThrow(
    /Could not find page or links to update/
  );
});

test("updateLink should remove a condition from a link to the next page", () => {
  expect(updateLink(data, "/1", "/2").pages[0].next).toEqual([{ path: "/2" }]);
});

test("updateLink should add a condition to a link to the next page", () => {
  expect(updateLink(data, "/1", "/2", "isKangaroos").pages[0].next).toEqual([
    { path: "/2", condition: "isKangaroos" },
  ]);
});
