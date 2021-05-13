import { FormDefinition } from "@xgovformbuilder/model";
import { findPage } from "..";

const data: FormDefinition = {
  pages: [
    {
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2" }],
      components: [{ name: "name1" }, { name: "name2" }],
    },
    {
      name: "page2",
      section: "section1",
      path: "/2",
      next: [{ path: "/3" }],
      components: [{ name: "name3" }, { name: "name4" }],
    },
  ],
};
test("findPage should throw if the page does not exist", () => {
  expect(() => findPage(data, "/404")).toThrow();
});

test("findPage should return the page and index if the page exists", () => {
  expect(findPage(data, "/2")).toEqual([
    {
      name: "page2",
      section: "section1",
      path: "/2",
      next: [{ path: "/3" }],
      components: [{ name: "name3" }, { name: "name4" }],
    },
    1,
  ]);
});
