import { getConditionType } from "../select-condition-helpers";

test("getConditionType returns string when the condition passed in is a string condition", () => {
  let condition = {
    name: "hasUKPassport",
    displayName: "hasUKPassport",
    value: "checkBeforeYouStart.ukPassport==true",
  };
  expect(getConditionType(condition)).toBe("string");
});
test("getConditionType returns nested when the condition passed in is a nested condition", () => {
  let condition = {
    displayName: "Page 1 is no and page 2 is no",
    name: "lqCigw",
    value: {
      name: "Page 1 is no and page 2 is no",
      conditions: [
        { conditionName: "zDnqpG", conditionDisplayName: "Page 1 is no" },
        {
          coordinator: "and",
          conditionName: "PCHZDP",
          conditionDisplayName: "Page 2 is no",
        },
      ],
    },
  };
  expect(getConditionType(condition)).toBe("nested");
});
test("getConditionType returns object when an object condition is passed in", () => {
  let condition = {
    displayName: "Page 1 is yes",
    name: "SIwgdM",
    value: {
      name: "Page 1 is yes",
      conditions: [
        {
          field: {
            name: "HQFhXb.YesNo",
            type: "YesNoField",
            display: "first page yes no",
          },
          operator: "is",
          value: { type: "Value", value: "true", display: "true" },
        },
      ],
    },
  };
  expect(getConditionType(condition)).toBe("object");
});
