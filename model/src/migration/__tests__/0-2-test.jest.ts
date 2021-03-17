import { migrate } from "../migration.0-2";

test("v0 form with list(s) is migrated to v2 successfully", () => {
  const testData = {
    pages: [
      {
        components: [
          {},
          {
            title: "my title",
            name: "myName",
            options: {
              list: "myList",
            },
          },
        ],
      },
      {
        components: [
          {
            title: "other list",
            name: "otherList",
            options: {
              list: "myOtherList",
            },
          },
        ],
      },
    ],
  };

  const expected = {
    pages: [
      {},
      {
        list: "myList",
        name: "myName",
        options: {},
        title: "my title",
      },
      {
        list: "myOtherList",
        name: "otherList",
        options: {},
        title: "other list",
      },
    ],
    version: 2,
  };

  expect(migrate(testData)).toEqual(expected);
});

test("v0 forms with no list is migrated to v2", () => {
  const data = {};
  expect(migrate(data)).toEqual(expect.objectContaining({ version: 2 }));
});
