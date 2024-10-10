import { FormDefinition } from "@xgovformbuilder/model";
import { updateCondition } from "..";

const condition = {
  displayName: "condition",
  name: "isCatPerson",
  value: { name: "newCondition", conditions: [] },
};
const data: FormDefinition = {
  conditions: [{ ...condition }],
  lists: [],
  name: "",
  pages: [],
  sections: [],
  startPage: "",
};
test("updateCondition throws if no condition could be found", () => {
  expect(() => updateCondition(data, "isDogPerson", {})).toThrow();
});

test("updateCondition successfully updates a condition", () => {
  expect(
    updateCondition(data, "isCatPerson", {
      name: "cats rule",
      asPerUserGroupings: [],
    })
  ).toEqual({
    conditions: [
      {
        displayName: "cats rule",
        name: "isCatPerson",
        value: { name: "newCondition", conditions: [] },
      },
    ],
    lists: [],
    name: "",
    pages: [],
    sections: [],
    startPage: "",
  });
});
