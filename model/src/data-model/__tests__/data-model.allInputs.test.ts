// @ts-nocheck
import { Data } from "../data-model";
describe("should return all inputs from the page model", () => {
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
  });

  expect(data.allInputs).toEqual([
    {
      name: "name1",
      page: { path: "page1", section: "section1" },
      propertyPath: "section1.name1",
      list: undefined,
      title: undefined,
      type: "Radios",
    },
    {
      name: "name2",
      page: { path: "page1", section: "section1" },
      propertyPath: "section1.name2",
      list: undefined,
      title: undefined,
      type: "Radios",
    },
    {
      name: "name3",
      page: { path: "page2", section: "section1" },
      propertyPath: "section1.name3",
      list: undefined,
      title: undefined,
      type: "Radios",
    },
    {
      name: "name4",
      page: { path: "page2", section: "section1" },
      propertyPath: "section1.name4",
      list: undefined,
      title: undefined,
      type: "Radios",
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
