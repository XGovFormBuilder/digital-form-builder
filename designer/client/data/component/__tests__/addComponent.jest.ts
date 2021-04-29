import { addComponent } from "..";
import { FormDefinition } from "@xgovformbuilder/model";

test("addComponent throws an error when no page can be found", () => {
  const data: FormDefinition = {
    conditions: [],
    lists: [],
    pages: [],
    sections: [],
  };

  expect(() => {
    addComponent(data, "doesntExist", {});
  }).toThrowError();
});

test("addComponent adds a component to the correct page", () => {
  const data: FormDefinition = {
    conditions: [],
    lists: [],
    pages: [
      {
        title: "first page",
        path: "/1",
        components: [
          {
            type: "TextField",
            name: "firstName",
            title: "First name",
            schema: {},
          },
        ],
      },
      {
        title: "second page",
        path: "/2",
        components: [
          {
            type: "TextField",
            name: "lastName",
            title: "Surname",
            schema: {},
          },
        ],
      },
    ],
    sections: [],
  };

  expect(
    addComponent(data, "/1", {
      type: "TextField",
      name: "aNewComponent",
      title: "new component",
      schema: {},
    })
  ).toEqual({
    conditions: [],
    lists: [],
    pages: [
      {
        title: "first page",
        path: "/1",
        components: [
          {
            type: "TextField",
            name: "firstName",
            title: "First name",
            schema: {},
          },
          {
            name: "aNewComponent",
            schema: {},
            title: "new component",
            type: "TextField",
          },
        ],
      },
      {
        title: "second page",
        path: "/2",
        components: [
          {
            type: "TextField",
            name: "lastName",
            title: "Surname",
            schema: {},
          },
        ],
      },
    ],
    sections: [],
  });
});
