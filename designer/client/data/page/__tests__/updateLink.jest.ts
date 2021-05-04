import { FormDefinition } from "@xgovformbuilder/model";
import { updateLink } from "..";

const data: FormDefinition = {
  pages: [
    {
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2", condition: "badgers" }],
      components: [{ name: "name1" }, { name: "name2" }],
    },
    {
      name: "page2",
      section: "section1",
      path: "/2",
      components: [{ name: "name3" }, { name: "name4" }],
    },
  ],
};

test("updateLink throws if from, to, or there is no existing link", () => {
  expect(() => updateLink(data, "/1", "404")).toThrow();
});

test("updateLink should remove a condition from a link to the next page", () => {
  expect(updateLink(data, "/1", "/2").pages[0].next).toBe([{ path: "/2" }]);
});

test("updateLink should add a condition to a link to the next page", () => {
  expect(updateLink(data, "/1", "/2", "isKangaroos").pages[0].next).toBe([
    { path: "/2", condition: "isKangaroos" },
  ]);
});
