import { FormDefinition } from "@xgovformbuilder/model";
import { hasConditions } from "../hasConditions";

test("hasCondition returns true when there are conditions", () => {
  const data: FormDefinition = {
    conditions: [
      { name: "a", displayName: "b", value: { name: "c", conditions: [] } },
    ],
    lists: [],
    pages: [],
    sections: [],
  };
  expect(hasConditions(data.conditions)).toBe(true);
});

test("hasCondition returns false when there aren't any conditions", () => {
  const data: FormDefinition = {
    conditions: [],
    lists: [],
    pages: [],
    sections: [],
  };
  expect(hasConditions(data.conditions)).toBe(false);
});
