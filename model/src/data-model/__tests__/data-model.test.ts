// @ts-nocheck

import { Data } from "../..";
import { RawData } from "../data-model";

describe("data model", () => {
  const fullyPopulatedRawData: RawData = {
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
    conditions: [
      { name: "badger", displayName: "Badgers", value: "badger == true" },
    ],
    feedback: {
      feedbackForm: false,
      url: "/feedback",
    },
    lists: [
      {
        name: "myList",
        type: "string",
        items: [
          {
            text: "some stuff",
            value: "myValue",
            description: "A hint",
            condition: "badger",
          },
          { text: "another thing", value: "anotherValue" },
        ],
      },
    ],
    phaseBanner: {
      phase: "alpha",
      feedbackUrl: "mailto:test@gov.uk",
    },
  };

  describe.only("allInputs", () => {
    test("should return all inputs from the page model", () => {
      const data = new Data({
        pages: [
          {
            path: "page1",
            section: "section1",
            components: [
              { name: "name1", type: "Radios" },
              { name: "name2", type: "Radios" },
            ],
          },
          {
            path: "page2",
            section: "section1",
            components: [
              { name: "name3", type: "Radios" },
              { name: "name4", type: "Radios" },
            ],
          },
        ],
      } as any);
      expect(data.allInputs).toEqual([
        {
          name: "name1",
          page: { path: "page1", section: "section1" },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: { path: "page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { path: "page2", section: "section1" },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { path: "page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should handle no pages", () => {
      const data = new Data({ pages: [] });
      expect(data.allInputs).toEqual([]);
    });

    test("should handle undefined pages", () => {
      const data = new Data({});
      expect(data.allInputs).toEqual([]);
    });

    test("should handle pages with undefined components", () => {
      const data = new Data({
        pages: [{}],
      });
      expect(data.allInputs).toEqual([]);
    });

    test("should handle pages with no components", () => {
      const data = new Data({
        pages: [{ components: [] }],
      });
      expect(data.allInputs).toEqual([]);
    });
  });

  // FIXME:- no consumers use this method!!
  describe("inputsAccessibleAt", () => {
    test("should return all inputs from the page model when a single route leads to this page", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
            next: [{ path: "/2" }],
            components: [
              { name: "name1", type: "Radios" },
              { name: "name2", type: "Radios" },
            ],
          },
          {
            name: "page2",
            section: "section1",
            path: "/2",
            next: [{ path: "/3" }],
            components: [
              { name: "name3", type: "Radios" },
              { name: "name4", type: "Radios" },
            ],
          },
          {
            name: "page3",
            path: "/3",
            components: [
              { name: "name5", type: "Radios" },
              { name: "name6", type: "Radios" },
            ],
          },
        ],
      });
      expect(data.inputsAccessibleAt("/3")).toEqual([
        {
          name: "name3",
          page: { path: "/2", section: "section1" },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { path: "/2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
        {
          name: "name1",
          page: { path: "/1", section: "section1" },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: { path: "/1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
      ]);
    });

    test("should handle no pages", () => {
      const data = new Data({ pages: [] });
      expect(data.inputsAccessibleAt("/1")).toEqual([]);
    });
  });

  describe("add link", () => {
    test("should add a link to the next page with no condition", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
            components: [{ name: "name1" }, { name: "name2" }],
          },
          {
            name: "page2",
            section: "section1",
            path: "/2",
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
      });
      const returned = data.addLink("/1", "/2");
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

    test("should add a link to the next page with a condition", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
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

      const returned = data.addLink("/1", "/2", "condition1");

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
  });

  describe("all paths", () => {
    test("allPathsLeadingTo should work with cycle in paths", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
          },
          {
            name: "page2",
            path: "/2",
            next: [{ path: "/1" }],
          },
          {
            name: "page3",
            path: "/3",
          },
        ],
      } as any);

      const paths = data.allPathsLeadingTo("/2");
      expect(paths).toEqual(["/1"]);
    });

    test("allPathsLeadingTo should work with single parents", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
          },
          {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
          },
          {
            name: "page3",
            path: "/3",
          },
        ],
      } as any);

      const paths = data.allPathsLeadingTo("/3");
      expect(paths).toEqual(["/2", "/1"]);
    });

    test("allPathsLeadingTo should work with multiple parents", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
          },
          {
            name: "page2",
            path: "/2",
            next: [{ path: "/4" }],
          },
          {
            name: "page3",
            path: "/3",
            next: [{ path: "/4" }],
          },
          {
            name: "page4",
            path: "/4",
          },
        ],
      } as any);

      const paths = data.allPathsLeadingTo("/4");
      expect(paths).toEqual(["/2", "/1", "/3"]);

      const paths1 = data.allPathsLeadingTo("/3");
      expect(paths1).toEqual(["/1"]);

      const paths2 = data.allPathsLeadingTo("/1");
      expect(paths2).toEqual([]);
    });
  });

  describe("update link", () => {
    test("should remove a condition from a link to the next page", () => {
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
      });
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

  describe("add section", () => {
    test("should add a section when no section exists with the same name", () => {
      const data = new Data({
        sections: [{ name: "a", title: "B" }],
      });
      const returned = data.addSection("badger", "Badger");
      expect(returned.sections.length).toEqual(2);
      expect(returned.sections.find((it) => it.name === "a")).toEqual({
        name: "a",
        title: "B",
      });
      expect(returned.sections.find((it) => it.name === "badger")).toEqual({
        name: "badger",
        title: "Badger",
      });
    });

    test("should not add a section when a section exists with the same name", () => {
      const data = new Data({
        sections: [{ name: "a", title: "B" }],
      });
      const returned = data.addSection("a", "Badger");
      expect(returned.sections.length).toEqual(1);
      expect(returned.sections.find((it) => it.name === "a")).toEqual({
        name: "a",
        title: "B",
      });
    });
  });

  describe("update links to", () => {
    test("should update all links pointing to the specified path to the new path", () => {
      const data = new Data({
        pages: [
          {
            name: "page0",
            path: "/0",
            next: [{ path: "/2", condition: "badgers" }],
            components: [{ name: "name1" }, { name: "name2" }],
          },
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
          {
            name: "page3",
            section: "section1",
            path: "/3",
            components: [],
          },
        ],
      });

      const returned = data.updateLinksTo("/2", "/7");

      expect(returned.findPage("/0")).toEqual({
        name: "page0",
        path: "/0",
        next: [{ path: "/7", condition: "badgers" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/1")).toEqual({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/7" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).toEqual({
        name: "page2",
        section: "section1",
        path: "/2",
        next: [{ path: "/3" }],
        components: [{ name: "name3" }, { name: "name4" }],
      });
      expect(returned.findPage("/3")).toEqual({
        name: "page3",
        section: "section1",
        path: "/3",
        components: [],
      });
    });
  });

  describe("list", () => {
    test("should return the page with the requested path if it exists", () => {
      const data = new Data({
        lists: [
          { name: "firstList" },
          { name: "myList" },
          { name: "anotherList" },
        ],
      });
      const returned = data.findList("myList");
      expect(returned === data.lists[1]).toEqual(true);
    });

    test("should return undefined if the requested list does not exist", () => {
      const data = new Data({
        lists: [{ name: "firstList" }],
      });

      expect(data.findList("myList")).toEqual(undefined);
    });

    test("should handle no lists", () => {
      const data = new Data({ lists: [] });
      expect(data.findList("/1")).toEqual(undefined);
    });

    test("should handle undefined lists", () => {
      const data = new Data({});
      expect(data.findList("/1")).toEqual(undefined);
    });

    test("add lists", () => {
      const data = new Data({});
      const list = {
        name: "Colors",
        title: "Colors",
        type: "string",
        items: [
          {
            text: "Blue",
            value: "blue",
            description: "Blue color",
            condition: "123",
          },
        ],
      };
      data.addList(list);
      expect(data.findList("Colors")).toMatchObject(list);
    });
  });

  describe("find page", () => {
    test("should return the page with the requested path if it exists", () => {
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
            next: [{ path: "/3" }],
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
      });
      const returned = data.findPage("/2");
      expect(returned === data.pages[1]).toEqual(true);
    });

    test("should return undefined if the requested page does not exist", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
            next: [{ path: "/3" }],
            components: [{ name: "name1" }, { name: "name2" }],
          },
        ],
      });

      expect(data.findPage("/2")).toEqual(undefined);
    });

    test("should handle no pages", () => {
      const data = new Data({ pages: [] });
      expect(data.findPage("/1")).toEqual(undefined);
    });

    test("should handle undefined pages", () => {
      const data = new Data({});
      expect(data.findPage("/1")).toEqual(undefined);
    });
  });

  describe("add page", () => {
    test("should add the page", () => {
      const data = new Data({
        pages: [],
      });
      const page = {
        name: "page2",
        section: "section1",
        path: "/2",
        next: [{ path: "/3" }],
        components: [{ name: "name3" }, { name: "name4" }],
      };
      data.addPage(page);
      expect(data.findPage("/2")).toEqual(page);
    });

    test("should add the page if no pages collection is defined", () => {
      const data = new Data({});
      const page = {
        name: "page2",
        section: "section1",
        path: "/2",
        next: [{ path: "/3" }],
        components: [{ name: "name3" }, { name: "name4" }],
      };
      data.addPage(page);
      expect(data.findPage("/2")).toEqual(page);
    });
  });

  describe("get pages", () => {
    test("should return the pages if they exist", () => {
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
            next: [{ path: "/3" }],
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
      });
      const returned = data.getPages();
      expect(returned === data.pages).toEqual(true);
    });

    test("should return empty array if undefined", () => {
      const data = new Data({});

      expect(data.getPages()).toEqual([]);
    });
  });

  describe("name", () => {
    test("should get the provided name", () => {
      const data = new Data({
        name: "My form",
      });
      expect(data.name).toEqual("My form");
    });

    test("should set the provided name", () => {
      const data = new Data({});
      data.name = "My form";
      expect(data.name).toEqual("My form");
    });

    test("should set to undefined", () => {
      const data = new Data({});
      data.name = undefined;
      expect(data.name).toEqual(undefined);
    });

    test("should error if setting the name to a non-string value", () => {
      const data = new Data({});
      expect(() => {
        data.name = 2;
      }).toThrow(Error);
    });
  });

  describe("feedbackForm", () => {
    test("should return true if set to true", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
        },
      });
      expect(data.feedbackForm).toEqual(true);
    });

    test("should return false if set to false", () => {
      const data = new Data({
        feedback: {
          feedbackForm: false,
        },
      });
      expect(data.feedbackForm).toEqual(false);
    });

    test("should return false if no value", () => {
      const data = new Data({
        feedback: {},
      });
      expect(data.feedbackForm).toEqual(false);
    });

    test("should return false if no feedback config", () => {
      const data = new Data({});
      expect(data.feedbackForm).toEqual(false);
    });

    test("should set the provided boolean", () => {
      const data = new Data({});
      data.feedbackForm = true;
      expect(data.feedbackForm).toEqual(true);
    });

    test("should error if setting to a non-boolean value", () => {
      const data = new Data({});
      expect(() => {
        data.feedbackForm = 2;
      }).toThrow(Error);
    });
  });

  describe("feedbackUrl", () => {
    test("should return value if set", () => {
      const data = new Data({
        feedback: {
          url: "/feedback",
        },
      });
      expect(data.feedbackUrl).toEqual("/feedback");
    });

    test("should return undefined if not set", () => {
      const data = new Data({
        feedback: {},
      });
      expect(data.feedbackUrl).toEqual(undefined);
    });

    test("should return undefined if no feedback config", () => {
      const data = new Data({});
      expect(data.feedbackUrl).toEqual(undefined);
    });
  });

  describe("addFeedbackUrl", () => {
    test("should set the provided string", () => {
      const data = new Data({});
      data.setFeedbackUrl("/feedback");
      expect(data.feedbackUrl).toEqual("/feedback");
    });

    test("should set feedback url to undefined and clear send context", () => {
      const data = new Data({
        feedback: {
          url: "/feedback",
        },
      });
      data.setFeedbackUrl();
      expect(data.feedbackUrl).toEqual(undefined);
    });

    test("should error if setting url to a non-string value", () => {
      const data = new Data({});
      expect(() => data.setFeedbackUrl(2)).toThrow(Error);
    });

    test("should error if setting url on a feedback form", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
        },
      });
      expect(() => data.setFeedbackUrl("/feedback")).toThrow(Error);
    });

    test("should not error if setting url to undefined on a feedback form", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
          url: "/feedback",
        },
      });
      data.setFeedbackUrl();
      expect(data.feedbackUrl).toEqual(undefined);
    });
  });

  describe("constructor", () => {
    test("should construct data model from raw data schema", () => {
      const returned = new Data(fullyPopulatedRawData);
      expect(returned.pages).toEqual(fullyPopulatedRawData.pages);
      expect(returned.conditions).toEqual(fullyPopulatedRawData.conditions);
      expect(returned.feedbackUrl).toEqual(fullyPopulatedRawData.feedback.url);
      expect(returned.feedbackForm).toEqual(
        fullyPopulatedRawData.feedback.feedbackForm
      );
      expect(returned instanceof Data).toEqual(true);
    });

    test("should construct data model from existing data model object", () => {
      const rawData = new Data(fullyPopulatedRawData);
      const returned = new Data(rawData);
      expect(returned.pages).toEqual(rawData.pages);
      expect(returned.conditions).toEqual(rawData.conditions);
      expect(returned.feedbackUrl).toEqual(rawData.feedbackUrl);
      expect(returned.feedbackForm).toEqual(rawData.feedbackForm);
      expect(returned instanceof Data).toEqual(true);
    });
  });

  describe("add component", () => {
    test("should add a component if a page exists with the specified path", () => {
      const data = new Data({
        pages: [{ path: "/1" }],
      });
      const returned = data.addComponent("/1", { name: "My name" });
      expect(returned.findPage("/1")).toEqual({
        path: "/1",
        components: [{ name: "My name" }],
      });
    });

    test("should add a component to a page with existing components", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      const returned = data.addComponent("/1", { name: "My name" });
      expect(returned.findPage("/1")).toEqual({
        path: "/1",
        components: [{ name: "First name" }, { name: "My name" }],
      });
    });

    test("should throw an error if no page exists with the specified path", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      expect(() => data.addComponent("/2", { name: "My name" })).toThrow(Error);
    });
  });

  describe("update component", () => {
    test("should update a component when the provided name is found in the specified page", () => {
      const data = new Data({
        pages: [
          {
            path: "/1",
            components: [
              { name: "anothercomponent" },
              { name: "mycomponent" },
              { name: "thirdComponent" },
            ],
          },
        ],
      });
      const returned = data.updateComponent("/1", "mycomponent", {
        name: "My name",
      });
      expect(returned.findPage("/1")).toEqual({
        path: "/1",
        components: [
          { name: "anothercomponent" },
          { name: "My name" },
          { name: "thirdComponent" },
        ],
      });
    });

    test("should throw an error if no page exists with the specified path", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      expect(() => data.updateComponent("/2", { name: "My name" })).toThrow(
        Error
      );
    });

    test("should throw an error if no component with the given name exists in the page", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      expect(() =>
        data.updateComponent("/1", "myComponent", { name: "My name" })
      ).toThrow(Error);
    });
  });

  describe("clone", () => {
    test("should deep clone the data class", () => {
      const data = new Data(fullyPopulatedRawData);
      const returned = data.clone();
      expect(returned).toEqual(data);
      expect(returned.conditions).toEqual(data.conditions);
      expect(returned.feedbackUrl).toEqual(data.feedbackUrl);
      expect(returned.feedbackForm).toEqual(data.feedbackForm);
      expect(returned instanceof Data).toEqual(true);
      expect(data === returned).toEqual(false);
    });

    test("random function property should be copied to data instance", () => {
      const sourceData = {
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
      const save = () => "badgers";
      sourceData.save = save;
      const data = new Data(sourceData);

      expect(data.save).toEqual(save);
      expect(data.save("something")).toEqual("badgers");
    });

    test("random function property should be copied on clone", () => {
      const sourceData = new Data({
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
      });
      const save = () => "badgers";
      sourceData.save = save;
      const data = sourceData.clone();

      expect(data.save).toEqual(save);
      expect(data.save("something")).toEqual("badgers");
    });
  });

  describe("add condition", () => {
    test("should add a condition if none exists with the name", () => {
      const data = new Data({
        conditions: [],
      });
      data.addCondition("someName", "My name", "a condition");
      expect(data.conditions).toEqual([
        { name: "someName", displayName: "My name", value: "a condition" },
      ]);
    });

    test("should create conditions in data model if they don't exist", () => {
      const data = new Data({});
      data.addCondition("someName", "My name", "a condition");
      expect(data.conditions).toEqual([
        { name: "someName", displayName: "My name", value: "a condition" },
      ]);
    });

    test("should throw error if a condition with the specified name exists", () => {
      const data = new Data({
        conditions: [],
      });
      data.addCondition("someName", "My name", "a condition");
      expect(() =>
        data.addCondition("someName", "another name", "awe shucks")
      ).toThrow(Error);
    });
  });

  describe("has conditions", () => {
    test("should return true if there is at least one condition", () => {
      const data = new Data({});
      data.addCondition("someName", "My name", "a condition");
      expect(data.hasConditions).toEqual(true);
    });

    test("should return false if no conditions array exists", () => {
      const data = new Data({});
      expect(data.hasConditions).toEqual(false);
    });

    test("should return false if there are no conditions", () => {
      const data = new Data({
        conditions: [],
      });
      expect(data.hasConditions).toEqual(false);
    });
  });

  describe("get conditions", () => {
    test("should return a clone of the conditions list", () => {
      const data = new Data({
        conditions: [
          { name: "some name", displayName: "My name", value: "a condition" },
        ],
      });
      const returned = data.conditions;
      expect(returned === data.conditions).toEqual(false);
      expect(returned).toEqual(data.conditions);
      returned[0].name = "badger";
      expect(data.conditions[0].name).toEqual("some name");
      expect(data.conditions[0].displayName).toEqual("My name");
    });

    test("should return empty if no conditions array exists", () => {
      const data = new Data({});
      expect(data.conditions).toEqual([]);
    });

    test("should return empty if there are no conditions", () => {
      const data = new Data({
        conditions: [],
      });
      expect(data.conditions).toEqual([]);
    });
  });

  describe("find condition", () => {
    test("should find a condition if one exists with the provided name", () => {
      const data = new Data({
        conditions: [{ name: "someName" }],
      });

      expect(data.findCondition("someName")).toMatchObject({
        name: "someName",
        displayName: "someName",
      });
    });

    test("should return undefined if there is no condition with the specified name", () => {
      const data = new Data({
        conditions: [{ name: "anotherName" }],
      });
      expect(data.findCondition("someName")).toEqual(undefined);
    });

    test("should return undefined if conditions is undefined", () => {
      const data = new Data({});
      expect(data.findCondition("someName")).toEqual(undefined);
    });
  });

  describe("update condition", () => {
    test("should update a condition if one exists with the provided name", () => {
      const data = new Data({
        conditions: [{ name: "someName" }],
      });
      data.updateCondition("someName", "My condition", "badgers == monkeys");
      expect(data.findCondition("someName")).toEqual({
        name: "someName",
        displayName: "My condition",
        value: "badgers == monkeys",
      });
    });

    test("should do nothing if there is no condition with the specified name", () => {
      const data = new Data({
        conditions: [{ name: "anotherName" }],
      });
      data.updateCondition("someName", "My condition", "Some value");
      expect(data.conditions).toEqual([
        { name: "anotherName", displayName: "anotherName", value: undefined },
      ]);
    });

    test("should do nothing if conditions is undefined", () => {
      const data = new Data({});
      data.updateCondition("someName", "My condition", "Some value");
      expect(data.conditions).toEqual([]);
    });
  });

  describe("remove condition", () => {
    test("should remove a condition if one exists with the provided name", () => {
      const data = new Data({
        conditions: [{ name: "someName" }],
      });
      data.removeCondition("someName");
      expect(data.conditions).toEqual([]);
    });

    test("should remove references to the removed condition if used in page links", () => {
      const data = new Data({
        pages: [
          { path: "/" },
          {
            path: "/badgers",
            next: [{ path: "/summary" }, { path: "/disaster", if: "someName" }],
          },
        ],
        conditions: [{ name: "someName" }],
      });
      data.removeCondition("someName");
      expect(data.findPage("/")).toEqual({ path: "/" });
      expect(data.findPage("/badgers")).toEqual({
        path: "/badgers",
        next: [{ path: "/summary" }, { path: "/disaster" }],
      });
    });

    test("should do nothing if there is no condition with the specified name", () => {
      const data = new Data({
        conditions: [{ name: "anotherName" }],
      });
      data.removeCondition("someName");
      expect(data.conditions).toEqual([
        { name: "anotherName", displayName: "anotherName", value: undefined },
      ]);
    });

    test("should do nothing if conditions is undefined", () => {
      const data = new Data({});
      data.removeCondition("someName");
      expect(data.conditions).toEqual([]);
    });
  });

  describe("Condition model", () => {
    test("Get expression should return string if value is a string", () => {
      const data = new Data({
        conditions: [{ name: "someName", value: "badgers == monkeys" }],
      });
      expect(data.findCondition("someName").expression).toEqual(
        "badgers == monkeys"
      );
    });

    test("Get expression should return parsed string from conditions model if value is a condition", () => {
      const data = new Data({
        conditions: [
          {
            name: "someName",
            value: {
              name: "someName",
              conditions: [
                {
                  field: {
                    name: "badger",
                    type: "TextField",
                    display: "Badger",
                  },
                  operator: "is",
                  value: {
                    type: "Value",
                    value: "Monkeys",
                    display: "Monkeys",
                  },
                },
              ],
            },
          },
        ],
      });
      expect(data.findCondition("someName").expression).toEqual(
        "badger == 'Monkeys'"
      );
    });
  });

  describe("phase banner: ", () => {
    test("empty phase banner object is set", () => {
      const rawData = { ...fullyPopulatedRawData };
      delete rawData.phaseBanner;

      const data = new Data(rawData);
      expect(typeof data.phaseBanner).toEqual("object");
      expect(data.phaseBanner).toEqual({});
    });

    test("phase banner object is initialised correctly", () => {
      const data = new Data({ ...fullyPopulatedRawData });
      expect(data.phaseBanner.phase).toEqual("alpha");
      expect(data.phaseBanner.feedbackUrl).toEqual("mailto:test@gov.uk");
    });

    test("phase property can be changed directly", () => {
      const data = new Data({ ...fullyPopulatedRawData });
      data.phaseBanner.phase = "beta";

      expect(data.phaseBanner).toEqual({
        phase: "beta",
        feedbackUrl: "mailto:test@gov.uk",
      });
    });
  });

  describe("toJSON", () => {
    const basicFormJSON = {
      conditions: [],
      lists: [],
      pages: [],
      sections: [],
      phaseBanner: {},
    };

    test("should expose the conditions field", () => {
      const rawData: any = {
        ...basicFormJSON,
        conditions: [
          {
            displayName: "a Monkey",
            name: "someName",
            value: "a Monkey value",
          },
        ],
      };
      const data = new Data(rawData);
      expect(data.toJSON()).toEqual(rawData);
    });

    test("should expose the name field", () => {
      const rawData: any = {
        ...basicFormJSON,
        name: "My form",
      };
      const data = new Data(rawData);
      expect(data.toJSON()).toEqual(rawData);
    });

    test("should expose the feedback field", () => {
      const rawData: any = {
        ...basicFormJSON,
        feedback: {
          feedbackForm: true,
        },
      };
      const data = new Data(rawData);
      expect(data.toJSON()).toEqual(rawData);
    });

    test("should expose the pages field", () => {
      const rawData: any = {
        pages: [{ name: "someName" }],
      };
      const data = new Data(rawData);
      expect(data.toJSON()).toEqual({
        ...basicFormJSON,
        pages: [{ name: "someName" }],
      });
    });

    test("should not expose a random function", () => {
      const rawData: any = {
        save: () => "Badgers",
      };
      const data = new Data(rawData);
      expect(data.toJSON()).toEqual({
        ...basicFormJSON,
      });
    });
  });
});
