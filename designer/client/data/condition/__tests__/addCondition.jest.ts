import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";
import { addCondition } from "../addCondition";
const data: FormDefinition = {
  conditions: [
    {
      displayName: "a condition",
      name: "isCondition",
      value: { name: "name", conditions: [] },
    },
  ],
  lists: [],
  name: "",
  pages: [],
  sections: [],
  startPage: "",
};

test("addCondition adds a condition to the list", () => {
  const condition: ConditionRawData = {
    displayName: "added condition",
    name: "new",
    value: { name: "newCondition", conditions: [] },
  };
  expect(addCondition(data, condition)).toEqual({
    conditions: [...data.conditions, condition],
    lists: [],
    name: "",
    pages: [],
    sections: [],
    startPage: "",
  });
});

test("addCondition throws if a condition with the same name already exists", () => {
  expect(() =>
    addCondition(data, {
      displayName: "a condition",
      name: "isCondition",
      value: { name: "name", conditions: [] },
    })
  ).toThrow(/A condition/);
});
