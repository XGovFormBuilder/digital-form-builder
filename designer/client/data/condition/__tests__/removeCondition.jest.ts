import { removeCondition } from "..";
import { FormDefinition } from "@xgovformbuilder/model";

const data: FormDefinition = {
  pages: [
    { next: [], path: "/" },
    {
      path: "/badgers",
      next: [
        { path: "/summary" },
        { path: "/disaster", condition: "someName" },
      ],
    },
  ],
  conditions: [{ name: "someName" }, { name: "anotherName" }],
};
test("removeCondition should remove conditions from the conditions key and in page links", () => {
  const updated = removeCondition(data, "someName");
  expect(updated).toEqual({
    pages: [
      { next: [], path: "/" },
      {
        path: "/badgers",
        next: [{ path: "/summary" }, { path: "/disaster" }],
      },
    ],
    conditions: [{ name: "anotherName" }],
  });
});

test("removeCondition should do nothing if the condition does not exist", () => {
  expect(removeCondition(data, "404")).toEqual(data);
});
