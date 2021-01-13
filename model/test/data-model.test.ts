import * as Code from "@hapi/code";
import * as Lab from "@hapi/lab";

import { Data } from "../src";

const { expect } = Code;

const lab = Lab.script();
exports.lab = lab;
const { suite, describe, test } = lab;

suite("data model", () => {
  function inputsAsObject(inputs) {
    return inputs.map((i) => ({ ...i }));
  }
  const fullyPopulatedRawData = {
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
  };

  describe("all inputs", () => {
    test("should return all inputs from the page model", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            components: [{ name: "name1" }, { name: "name2" }],
          },
          {
            name: "page2",
            section: "section1",
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
      } as any);

      expect(inputsAsObject(data.allInputs())).to.equal([
        {
          name: "name1",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should include feedback inputs for feedback form", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
        },
        startPage: "/page1",
        pages: [
          {
            name: "page1",
            path: "/page1",
            section: "section1",
            components: [{ name: "name1" }, { name: "name2" }],
          },
          {
            name: "page2",
            path: "/page2",
            section: "section1",
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
      });

      const inputs = inputsAsObject(data.allInputs());

      const expectedInputs = [
        {
          name: "name1",
          page: { name: "page1", path: "/page1", section: "section1" },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", path: "/page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { name: "page2", path: "/page2", section: "section1" },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", path: "/page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
        {
          name: "feedbackContextInfo_formTitle",
          type: "TextField",
          title: "Feedback source form name",
          page: { name: "page1", path: "/page1", section: "section1" },
          propertyPath: "feedbackContextInfo_formTitle",
        },
        {
          name: "feedbackContextInfo_pageTitle",
          type: "TextField",
          title: "Feedback source page title",
          page: { name: "page1", path: "/page1", section: "section1" },
          propertyPath: "feedbackContextInfo_pageTitle",
        },
        {
          name: "feedbackContextInfo_url",
          type: "TextField",
          title: "Feedback source url",
          page: { name: "page1", path: "/page1", section: "section1" },
          propertyPath: "feedbackContextInfo_url",
        },
      ];

      expectedInputs.forEach((input, i) => {
        expect(input).to.contain(inputs[i]);
      });
    });

    test("should include hidden inputs from values", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            components: [
              {
                name: "name1",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
              { name: "name2" },
            ],
          },
          {
            name: "page2",
            section: "section1",
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
        lists: [
          {
            name: "anotherList",
            title: "Address Yes/No",
            type: "string",
            items: [
              {
                text: "Yes",
                value: "true",
                description: "",
                condition: "",
                conditional: {
                  components: [
                    {
                      type: "TextField",
                      name: "buildingNameOrNumber",
                      title: "Building name or number",
                      hint: "",
                      schema: {},
                    },
                  ],
                },
              },
            ],
          },
          {
            name: "badgerList",
            title: "Badgers are epic",
            type: "string",
            items: [
              {
                text: "Something",
                value: "something",
                description: "",
                condition: "",
                conditional: {
                  components: [
                    {
                      name: "myField",
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([
        {
          name: "name1",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name1",
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          title: undefined,
        },
        {
          name: "myField",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.myField",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should not duplicate hidden inputs from children if more than one component in the same page uses the same hidden component", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            components: [
              {
                name: "name1",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
              {
                name: "name2",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
          {
            name: "page2",
            section: "section1",
            components: [{ name: "name3" }, { name: "name4" }],
          },
        ],
        lists: [
          {
            name: "anotherList",
            title: "Address Yes/No",
            type: "string",
            items: [
              {
                text: "Yes",
                value: "true",
                description: "",
                condition: "",
                conditional: {
                  components: [
                    {
                      type: "TextField",
                      name: "buildingNameOrNumber",
                      title: "Building name or number",
                      hint: "",
                      schema: {},
                    },
                  ],
                },
              },
            ],
          },
          {
            name: "badgerList",
            title: "Badgers are epic",
            type: "string",
            items: [
              {
                text: "Something",
                value: "something",
                description: "",
                condition: "",
                conditional: {
                  components: [
                    {
                      name: "myField",
                    },
                  ],
                },
              },
            ],
          },
        ],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([
        {
          name: "name1",
          page: { name: "page1", section: "section1" },
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "myField",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.myField",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", section: "section1" },
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should not duplicate hidden inputs from children if components in different pages with the same section use the same child", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            components: [
              {
                name: "name1",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
              { name: "name2" },
            ],
          },
          {
            name: "page2",
            section: "section1",
            components: [
              {
                name: "name3",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
              { name: "name4" },
            ],
          },
        ],
        lists: [],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([
        {
          name: "name1",
          page: { name: "page1", section: "section1" },
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "myField",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.myField",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { name: "page2", section: "section1" },
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should return multiple of the same hidden input from children if components in different pages with different sections use the same children", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            components: [
              {
                name: "name1",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
              { name: "name2" },
            ],
          },
          {
            name: "page2",
            section: "section2",
            components: [
              {
                name: "name3",
                values: {
                  type: "static",
                  valueType: "string",
                  items: [
                    {
                      display: "Something",
                      value: "something",
                      children: [
                        {
                          name: "myField",
                        },
                      ],
                    },
                  ],
                },
              },
              { name: "name4" },
            ],
          },
        ],
        lists: [],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([
        {
          name: "name1",
          page: { name: "page1", section: "section1" },
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "myField",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.myField",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: { name: "page2", section: "section2" },
          values: {
            type: "static",
            valueType: "string",
            items: [
              {
                display: "Something",
                value: "something",
                children: [
                  {
                    name: "myField",
                  },
                ],
              },
            ],
          },
          propertyPath: "section2.name3",
          title: undefined,
        },
        {
          name: "myField",
          page: { name: "page2", section: "section2" },
          propertyPath: "section2.myField",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", section: "section2" },
          propertyPath: "section2.name4",
          title: undefined,
        },
      ]);
    });

    test("should ignore unnamed components", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            components: [{ name: "name1" }, { name: "name2" }],
          },
          {
            name: "page2",
            section: "section1",
            components: [{ badger: "name3" }, { name: "name4" }],
          },
        ],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([
        {
          name: "name1",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: { name: "page1", section: "section1" },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should handle no pages", () => {
      const data = new Data({ pages: [] });
      expect(inputsAsObject(data.allInputs())).to.equal([]);
    });

    test("should handle undefined pages", () => {
      const data = new Data({});
      expect(inputsAsObject(data.allInputs())).to.equal([]);
    });

    test("should handle pages with undefined components", () => {
      const data = new Data({
        pages: [{}],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([]);
    });

    test("should handle pages with no components", () => {
      const data = new Data({
        pages: [{ components: [] }],
      });
      expect(inputsAsObject(data.allInputs())).to.equal([]);
    });
  });

  describe("all inputs accessible by", () => {
    test("should return all inputs from the page model when a single route leads to this page", () => {
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
          {
            name: "page3",
            path: "/3",
            components: [{ name: "name5" }, { name: "name6" }],
          },
        ],
      });

      const inputs = inputsAsObject(data.inputsAccessibleAt("/3"));
      const expectedInputs = [
        {
          name: "name1",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name4",
          title: undefined,
        },
        {
          name: "name5",
          page: { name: "page3", path: "/3" },
          propertyPath: "name5",
          title: undefined,
        },
        {
          name: "name6",
          page: { name: "page3", path: "/3" },
          propertyPath: "name6",
          title: undefined,
        },
      ];

      inputs.forEach((input, i) => {
        expect(input).to.contain(expectedInputs[i]);
      });
    });

    test("should include inputs from multiple branches leading to the requested page", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
            next: [{ path: "/3" }],
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
            path: "/3",
            components: [{ name: "name5" }, { name: "name6" }],
          },
        ],
      });

      expect(data.inputsAccessibleAt("/3")).to.equal([
        {
          name: "name1",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name4",
          title: undefined,
        },
        {
          name: "name5",
          page: { name: "page3", path: "/3" },
          propertyPath: "name5",
          title: undefined,
        },
        {
          name: "name6",
          page: { name: "page3", path: "/3" },
          propertyPath: "name6",
          title: undefined,
        },
      ]);
    });

    test("should include feedback context inputs for feedback form", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
        },
        startPage: "/1",
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
          {
            name: "page3",
            path: "/3",
            components: [{ name: "name5" }, { name: "name6" }],
          },
        ],
      });
      const inputs = inputsAsObject(data.inputsAccessibleAt("/3"));

      const expectedInputs = [
        {
          name: "name1",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name3",
          page: {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name3",
          title: undefined,
        },
        {
          name: "name4",
          page: {
            name: "page2",
            path: "/2",
            next: [{ path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name4",
          title: undefined,
        },
        {
          name: "name5",
          page: { name: "page3", path: "/3" },
          propertyPath: "name5",
          title: undefined,
        },
        {
          name: "name6",
          page: { name: "page3", path: "/3" },
          propertyPath: "name6",
          title: undefined,
        },
        {
          name: "feedbackContextInfo_formTitle",
          type: "TextField",
          title: "Feedback source form name",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "feedbackContextInfo_formTitle",
          hint: "",
          options: {},
          schema: {},
        },
        {
          name: "feedbackContextInfo_pageTitle",
          type: "TextField",
          title: "Feedback source page title",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "feedbackContextInfo_pageTitle",
          hint: "",
          options: {},
          schema: {},
        },
        {
          name: "feedbackContextInfo_url",
          type: "TextField",
          title: "Feedback source url",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }],
            section: "section1",
          },
          propertyPath: "feedbackContextInfo_url",
          hint: "",
          options: {},
          schema: {},
        },
      ];

      expectedInputs.forEach((input, i) => {
        expect(input).to.include(inputs[i]);
      });
    });

    test("should ignore inputs from routes that don't lead to the requested page", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
            components: [{ name: "name1" }, { name: "name2" }],
          },
          {
            name: "page2",
            section: "section1",
            path: "/2",
            next: [{ path: "/4" }],
            components: [{ name: "name3" }, { name: "name4" }],
          },
          {
            name: "page3",
            path: "/3",
            components: [{ name: "name5" }, { name: "name6" }],
          },
        ],
      });

      const expectedInputs = [
        {
          name: "name1",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name5",
          page: { name: "page3", path: "/3" },
          propertyPath: "name5",
          title: undefined,
        },
        {
          name: "name6",
          page: { name: "page3", path: "/3" },
          propertyPath: "name6",
          title: undefined,
        },
      ];
      const inputs = inputsAsObject(data.inputsAccessibleAt("/3"));

      expectedInputs.forEach((input, i) => {
        expect(input).to.include(inputs[i]);
      });
    });

    test("should ignore unnamed components", () => {
      const data = new Data({
        pages: [
          {
            name: "page1",
            section: "section1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
            components: [{ name: "name1" }, { name: "name2" }],
          },
          {
            name: "page2",
            section: "section1",
            path: "/2",
            components: [{ badger: "name3" }, { name: "name4" }],
          },
        ],
      });

      expect(data.inputsAccessibleAt("/2")).to.equal([
        {
          name: "name1",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name1",
          title: undefined,
        },
        {
          name: "name2",
          page: {
            name: "page1",
            path: "/1",
            next: [{ path: "/2" }, { path: "/3" }],
            section: "section1",
          },
          propertyPath: "section1.name2",
          title: undefined,
        },
        {
          name: "name4",
          page: { name: "page2", path: "/2", section: "section1" },
          propertyPath: "section1.name4",
          title: undefined,
        },
      ]);
    });

    test("should handle no pages", () => {
      const data = new Data({ pages: [] });
      expect(data.inputsAccessibleAt("/1")).to.equal([]);
    });

    test("should handle undefined pages", () => {
      const data = new Data({});
      expect(data.inputsAccessibleAt("/1")).to.equal([]);
    });

    test("should handle pages with undefined components", () => {
      const data = new Data({
        pages: [{ path: "/1" }],
      });
      expect(data.inputsAccessibleAt("/1")).to.equal([]);
    });

    test("should handle pages with no components", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [] }],
      });
      expect(data.inputsAccessibleAt("/1")).to.equal([]);
    });
  });

  describe("values for", () => {
    const staticValues = {
      type: "static",
      valueType: "string",
      items: [
        {
          label: "some stuff",
          value: "myValue",
          hint: "A hint",
          condition: "badger",
          children: [{ name: "aBadger" }],
        },
        {
          label: "another thing",
          value: "anotherValue",
          hint: undefined,
          condition: undefined,
          children: [],
        },
      ],
    };
    const valuesTypes = [
      staticValues,
      {
        type: "listRef",
        list: "myList",
        valueChildren: [
          {
            value: "myValue",
            children: [{ name: "aBadger" }],
          },
        ],
      },
    ];
    valuesTypes.forEach((values) => {
      test(`should return the '${values.type}' values specified in the provided input if it exists`, () => {
        const data = new Data(fullyPopulatedRawData);
        const returned = data.valuesFor({ values: values });
        delete returned.values.toStaticValues;
        expect(returned.values).to.equal(values);
      });

      test(`returned '${values.type}' values should convert to static values`, () => {
        const data = new Data(fullyPopulatedRawData);
        const returned = data.valuesFor({ values: values });
        expect(returned.toStaticValues()).to.equal(staticValues);
      });
    });

    test("should return undefined if no values exist", () => {
      const data = new Data({});

      expect(data.valuesFor({ options: {} })).to.equal(undefined);
    });

    test("should return yes/no list if the provided input has no values defined but is a YesNoField", () => {
      const data = new Data({});

      expect(data.valuesFor({ type: "YesNoField" }).toStaticValues()).to.equal({
        type: "static",
        valueType: "boolean",
        items: [
          {
            label: "Yes",
            value: true,
            hint: undefined,
            condition: undefined,
            children: [],
          },
          {
            label: "No",
            value: false,
            hint: undefined,
            condition: undefined,
            children: [],
          },
        ],
      });
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
      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/2" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
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

      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/2", condition: "condition1" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
        name: "page2",
        section: "section1",
        path: "/2",
        components: [{ name: "name3" }, { name: "name4" }],
      });
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
      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/2" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
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

      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/2", condition: "condition1" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
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

      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/2", condition: "condition1" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
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

      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/2" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
        name: "page2",
        section: "section1",
        path: "/2",
        components: [{ name: "name3" }, { name: "name4" }],
      });
      expect(returned.findPage("/3")).to.equal({
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
      expect(returned.sections.length).to.equal(2);
      expect(returned.sections.find((it) => it.name === "a")).to.equal({
        name: "a",
        title: "B",
      });
      expect(returned.sections.find((it) => it.name === "badger")).to.equal({
        name: "badger",
        title: "Badger",
      });
    });

    test("should not add a section when a section exists with the same name", () => {
      const data = new Data({
        sections: [{ name: "a", title: "B" }],
      });
      const returned = data.addSection("a", "Badger");
      expect(returned.sections.length).to.equal(1);
      expect(returned.sections.find((it) => it.name === "a")).to.equal({
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

      expect(returned.findPage("/0")).to.equal({
        name: "page0",
        path: "/0",
        next: [{ path: "/7", condition: "badgers" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/1")).to.equal({
        name: "page1",
        section: "section1",
        path: "/1",
        next: [{ path: "/7" }],
        components: [{ name: "name1" }, { name: "name2" }],
      });
      expect(returned.findPage("/2")).to.equal({
        name: "page2",
        section: "section1",
        path: "/2",
        next: [{ path: "/3" }],
        components: [{ name: "name3" }, { name: "name4" }],
      });
      expect(returned.findPage("/3")).to.equal({
        name: "page3",
        section: "section1",
        path: "/3",
        components: [],
      });
    });
  });

  describe("find list", () => {
    test("should return the page with the requested path if it exists", () => {
      const data = new Data({
        lists: [
          { name: "firstList" },
          { name: "myList" },
          { name: "anotherList" },
        ],
      });
      const returned = data.findList("myList");
      expect(returned === data.lists[1]).to.equal(true);
    });

    test("should return undefined if the requested list does not exist", () => {
      const data = new Data({
        lists: [{ name: "firstList" }],
      });

      expect(data.findList("myList")).to.equal(undefined);
    });

    test("should handle no lists", () => {
      const data = new Data({ lists: [] });
      expect(data.findList("/1")).to.equal(undefined);
    });

    test("should handle undefined lists", () => {
      const data = new Data({});
      expect(data.findList("/1")).to.equal(undefined);
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
      expect(returned === data.pages[1]).to.equal(true);
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

      expect(data.findPage("/2")).to.equal(undefined);
    });

    test("should handle no pages", () => {
      const data = new Data({ pages: [] });
      expect(data.findPage("/1")).to.equal(undefined);
    });

    test("should handle undefined pages", () => {
      const data = new Data({});
      expect(data.findPage("/1")).to.equal(undefined);
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
      expect(data.findPage("/2")).to.equal(page);
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
      expect(data.findPage("/2")).to.equal(page);
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
      expect(returned === data.pages).to.equal(true);
    });

    test("should return empty array if undefined", () => {
      const data = new Data({});

      expect(data.getPages()).to.equal([]);
    });
  });

  describe("name", () => {
    test("should get the provided name", () => {
      const data = new Data({
        name: "My form",
      });
      expect(data.name).to.equal("My form");
    });

    test("should set the provided name", () => {
      const data = new Data({});
      data.name = "My form";
      expect(data.name).to.equal("My form");
    });

    test("should set to undefined", () => {
      const data = new Data({});
      data.name = undefined;
      expect(data.name).to.equal(undefined);
    });

    test("should error if setting the name to a non-string value", () => {
      const data = new Data({});
      expect(() => {
        data.name = 2;
      }).to.throw(Error);
    });
  });

  describe("feedbackForm", () => {
    test("should return true if set to true", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
        },
      });
      expect(data.feedbackForm).to.equal(true);
    });

    test("should return false if set to false", () => {
      const data = new Data({
        feedback: {
          feedbackForm: false,
        },
      });
      expect(data.feedbackForm).to.equal(false);
    });

    test("should return false if no value", () => {
      const data = new Data({
        feedback: {},
      });
      expect(data.feedbackForm).to.equal(false);
    });

    test("should return false if no feedback config", () => {
      const data = new Data({});
      expect(data.feedbackForm).to.equal(false);
    });

    test("should set the provided boolean", () => {
      const data = new Data({});
      data.feedbackForm = true;
      expect(data.feedbackForm).to.equal(true);
    });

    test("should error if setting to a non-boolean value", () => {
      const data = new Data({});
      expect(() => {
        data.feedbackForm = 2;
      }).to.throw(Error);
    });
  });

  describe("feedbackUrl", () => {
    test("should return value if set", () => {
      const data = new Data({
        feedback: {
          url: "/feedback",
        },
      });
      expect(data.feedbackUrl).to.equal("/feedback");
    });

    test("should return undefined if not set", () => {
      const data = new Data({
        feedback: {},
      });
      expect(data.feedbackUrl).to.equal(undefined);
    });

    test("should return undefined if no feedback config", () => {
      const data = new Data({});
      expect(data.feedbackUrl).to.equal(undefined);
    });
  });

  describe("addFeedbackUrl", () => {
    test("should set the provided string", () => {
      const data = new Data({});
      data.setFeedbackUrl("/feedback");
      expect(data.feedbackUrl).to.equal("/feedback");
    });

    test("should set feedback url to undefined and clear send context", () => {
      const data = new Data({
        feedback: {
          url: "/feedback",
        },
      });
      data.setFeedbackUrl();
      expect(data.feedbackUrl).to.equal(undefined);
    });

    test("should error if setting url to a non-string value", () => {
      const data = new Data({});
      expect(() => data.setFeedbackUrl(2)).to.throw(Error);
    });

    test("should error if setting url on a feedback form", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
        },
      });
      expect(() => data.setFeedbackUrl("/feedback")).to.throw(Error);
    });

    test("should not error if setting url to undefined on a feedback form", () => {
      const data = new Data({
        feedback: {
          feedbackForm: true,
          url: "/feedback",
        },
      });
      data.setFeedbackUrl();
      expect(data.feedbackUrl).to.equal(undefined);
    });
  });

  describe("constructor", () => {
    test("should construct data model from raw data schema", () => {
      const returned = new Data(fullyPopulatedRawData);
      expect(returned.pages).to.equal(fullyPopulatedRawData.pages);
      expect(returned.conditions).to.equal(fullyPopulatedRawData.conditions);
      expect(returned.feedbackUrl).to.equal(fullyPopulatedRawData.feedback.url);
      expect(returned.feedbackForm).to.equal(
        fullyPopulatedRawData.feedback.feedbackForm
      );
      expect(returned instanceof Data).to.equal(true);
    });

    test("should construct data model from existing data model object", () => {
      const rawData = new Data(fullyPopulatedRawData);
      const returned = new Data(rawData);
      expect(returned.pages).to.equal(rawData.pages);
      expect(returned.conditions).to.equal(rawData.conditions);
      expect(returned.feedbackUrl).to.equal(rawData.feedbackUrl);
      expect(returned.feedbackForm).to.equal(rawData.feedbackForm);
      expect(returned instanceof Data).to.equal(true);
    });
  });

  describe("add component", () => {
    test("should add a component if a page exists with the specified path", () => {
      const data = new Data({
        pages: [{ path: "/1" }],
      });
      const returned = data.addComponent("/1", { name: "My name" });
      expect(returned.findPage("/1")).to.equal({
        path: "/1",
        components: [{ name: "My name" }],
      });
    });

    test("should add a component to a page with existing components", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      const returned = data.addComponent("/1", { name: "My name" });
      expect(returned.findPage("/1")).to.equal({
        path: "/1",
        components: [{ name: "First name" }, { name: "My name" }],
      });
    });

    test("should throw an error if no page exists with the specified path", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      expect(() => data.addComponent("/2", { name: "My name" })).to.throw(
        Error
      );
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
      expect(returned.findPage("/1")).to.equal({
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
      expect(() => data.updateComponent("/2", { name: "My name" })).to.throw(
        Error
      );
    });

    test("should throw an error if no component with the given name exists in the page", () => {
      const data = new Data({
        pages: [{ path: "/1", components: [{ name: "First name" }] }],
      });
      expect(() =>
        data.updateComponent("/1", "myComponent", { name: "My name" })
      ).to.throw(Error);
    });
  });

  describe("clone", () => {
    test("should deep clone the data class", () => {
      const data = new Data(fullyPopulatedRawData);
      const returned = data.clone();
      expect(returned).to.equal(data);
      expect(returned.conditions).to.equal(data.conditions);
      expect(returned.feedbackUrl).to.equal(data.feedbackUrl);
      expect(returned.feedbackForm).to.equal(data.feedbackForm);
      expect(returned instanceof Data).to.equal(true);
      expect(data === returned).to.equal(false);
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

      expect(data.save).to.equal(save);
      expect(data.save("something")).to.equal("badgers");
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

      expect(data.save).to.equal(save);
      expect(data.save("something")).to.equal("badgers");
    });
  });

  describe("add condition", () => {
    test("should add a condition if none exists with the name", () => {
      const data = new Data({
        conditions: [],
      });
      data.addCondition("someName", "My name", "a condition");
      expect(data.conditions).to.equal([
        { name: "someName", displayName: "My name", value: "a condition" },
      ]);
    });

    test("should create conditions in data model if they don't exist", () => {
      const data = new Data({});
      data.addCondition("someName", "My name", "a condition");
      expect(data.conditions).to.equal([
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
      ).to.throw(Error);
    });
  });

  describe("has conditions", () => {
    test("should return true if there is at least one condition", () => {
      const data = new Data({});
      data.addCondition("someName", "My name", "a condition");
      expect(data.hasConditions).to.equal(true);
    });

    test("should return false if no conditions array exists", () => {
      const data = new Data({});
      expect(data.hasConditions).to.equal(false);
    });

    test("should return false if there are no conditions", () => {
      const data = new Data({
        conditions: [],
      });
      expect(data.hasConditions).to.equal(false);
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
      expect(returned === data.conditions).to.equal(false);
      expect(returned).to.equal(data.conditions);
      returned[0].name = "badger";
      expect(data.conditions[0].name).to.equal("some name");
      expect(data.conditions[0].displayName).to.equal("My name");
    });

    test("should return empty if no conditions array exists", () => {
      const data = new Data({});
      expect(data.conditions).to.equal([]);
    });

    test("should return empty if there are no conditions", () => {
      const data = new Data({
        conditions: [],
      });
      expect(data.conditions).to.equal([]);
    });
  });

  describe("find condition", () => {
    test("should find a condition if one exists with the provided name", () => {
      const data = new Data({
        conditions: [{ name: "someName" }],
      });
      expect(data.findCondition("someName")).to.contain({
        name: "someName",
        displayName: "someName",
      });
    });

    test("should return undefined if there is no condition with the specified name", () => {
      const data = new Data({
        conditions: [{ name: "anotherName" }],
      });
      expect(data.findCondition("someName")).to.equal(undefined);
    });

    test("should return undefined if conditions is undefined", () => {
      const data = new Data({});
      expect(data.findCondition("someName")).to.equal(undefined);
    });
  });

  describe("update condition", () => {
    test("should update a condition if one exists with the provided name", () => {
      const data = new Data({
        conditions: [{ name: "someName" }],
      });
      data.updateCondition("someName", "My condition", "badgers == monkeys");
      expect(data.findCondition("someName")).to.equal({
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
      expect(data.conditions).to.equal([
        { name: "anotherName", displayName: "anotherName", value: undefined },
      ]);
    });

    test("should do nothing if conditions is undefined", () => {
      const data = new Data({});
      data.updateCondition("someName", "My condition", "Some value");
      expect(data.conditions).to.equal([]);
    });
  });

  describe("remove condition", () => {
    test("should remove a condition if one exists with the provided name", () => {
      const data = new Data({
        conditions: [{ name: "someName" }],
      });
      data.removeCondition("someName");
      expect(data.conditions).to.equal([]);
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
      expect(data.findPage("/")).to.equal({ path: "/" });
      expect(data.findPage("/badgers")).to.equal({
        path: "/badgers",
        next: [{ path: "/summary" }, { path: "/disaster" }],
      });
    });

    test("should do nothing if there is no condition with the specified name", () => {
      const data = new Data({
        conditions: [{ name: "anotherName" }],
      });
      data.removeCondition("someName");
      expect(data.conditions).to.equal([
        { name: "anotherName", displayName: "anotherName", value: undefined },
      ]);
    });

    test("should do nothing if conditions is undefined", () => {
      const data = new Data({});
      data.removeCondition("someName");
      expect(data.conditions).to.equal([]);
    });
  });

  describe("Condition model", () => {
    test("Get expression should return string if value is a string", () => {
      const data = new Data({
        conditions: [{ name: "someName", value: "badgers == monkeys" }],
      });
      expect(data.findCondition("someName").expression).to.equal(
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
      expect(data.findCondition("someName").expression).to.equal(
        "badger == 'Monkeys'"
      );
    });
  });

  describe("toJSON", () => {
    test("should expose the conditions field", () => {
      const rawData: any = {
        conditions: [
          {
            displayName: "a Monkey",
            name: "someName",
            value: "a Monkey value",
          },
        ],
        lists: [],
        pages: [],
        sections: [],
      };
      const data = new Data(rawData);
      expect(data.toJSON()).to.equal(rawData);
    });

    test("should expose the name field", () => {
      const rawData: any = {
        conditions: [],
        name: "My form",
        lists: [],
        pages: [],
        sections: [],
      };
      const data = new Data(rawData);
      expect(data.toJSON()).to.equal(rawData);
    });

    test("should expose the feedback field", () => {
      const rawData = {
        conditions: [],
        feedback: {
          feedbackForm: true,
        },
        lists: [],
        pages: [],
        sections: [],
      };
      const data = new Data(rawData);
      expect(data.toJSON()).to.equal(rawData);
    });

    test("should expose the pages field", () => {
      const rawData = {
        pages: [{ name: "someName" }],
      };
      const data = new Data(rawData);
      expect(data.toJSON()).to.equal({
        pages: [{ name: "someName" }],
        conditions: [],
        lists: [],
        sections: [],
      });
    });

    test("should not expose a random function", () => {
      const rawData = {
        save: () => "Badgers",
      };
      const data = new Data(rawData);
      expect(data.toJSON()).to.equal({
        conditions: [],
        lists: [],
        pages: [],
        sections: [],
      });
    });
  });
});
