import { FormDefinition } from "@xgovformbuilder/model";
import { updateLinksTo } from "../updateLinksTo";

const data: FormDefinition = {
  pages: [
    {
      title: "page0",
      path: "/0",
      next: [{ path: "/2", condition: "badgers" }],
      components: [{ name: "name1" }, { name: "name2" }],
    },
    {
      title: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2" }],
      components: [{ name: "name1" }, { name: "name2" }],
    },
    {
      title: "page2",
      section: "section1",
      path: "/2",
      next: [{ path: "/3" }],
      components: [{ name: "name3" }, { name: "name4" }],
    },
    {
      section: "section1",
      path: "/3",
      components: [],
    },
  ],
};
test("updateLinksTo should update all links pointing to the specified path to the new path", () => {
  const returned = updateLinksTo(data, "/2", "/7");
  expect(returned).toEqual({
    pages: [
      {
        title: "page0",
        path: "/0",
        next: [{ path: "/7", condition: "badgers" }],
        components: [{ name: "name1" }, { name: "name2" }],
      },
      {
        title: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/7" }],
        components: [{ name: "name1" }, { name: "name2" }],
      },
      {
        title: "page2",
        section: "section1",
        path: "/7",
        next: [{ path: "/3" }],
        components: [{ name: "name3" }, { name: "name4" }],
      },
      {
        section: "section1",
        path: "/3",
        components: [],
        next: [],
      },
    ],
  });
});
