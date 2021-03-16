import { migrate } from "../migration.1-2";
jest.mock("../../utils/helpers", () => {
  return {
    __esModule: true,
    nanoid: jest.fn().mockReturnValueOnce("id-1").mockReturnValueOnce("id-2"),
  };
});
test("migrate from version 1 to 2", () => {
  const testData = {
    pages: [
      {
        path: "/pg1",
        components: [
          {},
          {
            title: "my title",
            name: "myName",
            values: {
              type: "static",
              items: [
                {
                  label: "A thing",
                  value: "myThing",
                  condition: "aCondition",
                  hint: "Jobbie",
                },
                {
                  label: "Another thing",
                  value: "myOtherThing",
                  something: "Something else",
                },
              ],
            },
          },
        ],
      },
      {
        path: "/pg2",
        components: [
          {
            title: "other list",
            name: "otherList",
            values: {
              type: "static",
              items: [
                {
                  label: "aa",
                  value: "aa",
                  hint: "aahint",
                },
                {
                  label: "bb",
                  value: "bb",
                },
              ],
            },
          },
          {
            title: "countries question",
            name: "cq",
            values: {
              type: "listRef",
              list: "countries",
            },
          },
        ],
      },
    ],
  };

  const expected = {
    lists: [
      {
        items: [
          {
            conditions: "aCondition",
            hint: "Jobbie",
            title: "A thing",
            value: "myThing",
          },
          {
            title: "Another thing",
            value: "myOtherThing",
          },
        ],
        name: "id-1",
        title: "my title",
      },
      {
        items: [
          {
            hint: "aahint",
            title: "aa",
            value: "aa",
          },
          {
            title: "bb",
            value: "bb",
          },
        ],
        name: "id-2",
        title: "other list",
      },
    ],
    pages: [
      {
        path: "/pg1",
        components: [
          {},
          {
            list: "id-1",
            name: "myName",
            title: "my title",
          },
        ],
      },
      {
        path: "/pg2",
        components: [
          {
            list: "id-2",
            name: "otherList",
            title: "other list",
          },
          {
            list: "countries",
            name: "cq",
            title: "countries question",
          },
        ],
      },
    ],
    version: 2,
  };

  expect(migrate(testData)).toEqual(expected);
});
