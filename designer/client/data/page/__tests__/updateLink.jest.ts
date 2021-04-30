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
  const updated = updateLink(data, "/1", "/2");
});

describe("update link", () => {
  test("should remove a condition from a link to the next page", () => {
    const returned = data.updateLink("/1", "/2");
    expect(returned.findPage("/1")).toEqual({
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2" }],
      components: [{ name: "name1" }, { name: "name2" }],
    });
    expect(returned.findPage("/2")).toEqual({
      name: "page2",
      section: "section1",
      path: "/2",
      components: [{ name: "name3" }, { name: "name4" }],
    });
  });

  test("should add a condition to a link to the next page", () => {
    const returned = data.updateLink("/1", "/2", "condition1");

    expect(returned.findPage("/1")).toEqual({
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2", condition: "condition1" }],
      components: [{ name: "name1" }, { name: "name2" }],
    });
    expect(returned.findPage("/2")).toEqual({
      name: "page2",
      section: "section1",
      path: "/2",
      components: [{ name: "name3" }, { name: "name4" }],
    });
  });

  test("should replace a condition on a link", () => {
    const data = new Data({
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
      conditions: [{ name: "condition1" }],
    });

    const returned = data.updateLink("/1", "/2", "condition1");

    expect(returned.findPage("/1")).toEqual({
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2", condition: "condition1" }],
      components: [{ name: "name1" }, { name: "name2" }],
    });
    expect(returned.findPage("/2")).toEqual({
      name: "page2",
      section: "section1",
      path: "/2",
      components: [{ name: "name3" }, { name: "name4" }],
    });
  });

  test("should do nothing if the specified link does not exist", () => {
    const data = new Data({
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
          components: [{ name: "name3" }, { name: "name4" }],
        },
        {
          name: "page3",
          section: "section1",
          path: "/3",
          components: [{ name: "name5" }, { name: "name6" }],
        },
      ],
      conditions: [{ name: "condition1" }],
    });

    const returned = data.updateLink("/1", "/3", "condition1");

    expect(returned.findPage("/1")).toEqual({
      name: "page1",
      section: "section1",
      path: "/1",
      next: [{ path: "/2" }],
      components: [{ name: "name1" }, { name: "name2" }],
    });
    expect(returned.findPage("/2")).toEqual({
      name: "page2",
      section: "section1",
      path: "/2",
      components: [{ name: "name3" }, { name: "name4" }],
    });
    expect(returned.findPage("/3")).toEqual({
      name: "page3",
      section: "section1",
      path: "/3",
      components: [{ name: "name5" }, { name: "name6" }],
    });
  });
});
