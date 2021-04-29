import { ConditionRawData, FormDefinition } from "@xgovformbuilder/model";
import { addCondition } from "../addCondition";

test("addCondition adds a condition to the list", () => {
  const data: FormDefinition = {
    conditions: [],
    lists: [],
    name: "",
    pages: [],
    sections: [],
    startPage: "",
  };
  const condition: ConditionRawData = {
    displayName: "added condition",
    name: "new",
    value: { name: "newCondition", conditions: [] },
  };
  expect(addCondition(data, condition)).toEqual({
    conditions: [{ ...condition }],
    lists: [],
    name: "",
    pages: [],
    sections: [],
    startPage: "",
  });
});
