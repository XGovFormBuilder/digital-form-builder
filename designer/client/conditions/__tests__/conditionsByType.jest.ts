import { conditionsByType } from "./../select-condition-helpers";

const stringCondition = {
  name: "likesScrambledEggs",
  displayName: "Likes scrambled eggs",
  value: "likeScrambled == true",
};

const objectCondition = {
  name: "likesFriedEggsCond",
  displayName: "Likes fried eggs",
  value: {
    name: "likesFriedEggs",
    conditions: [
      {
        value: {
          name: "likesFried",
          displayName: "Do you like fried eggs?",
          field: {
            name: "likesFried",
            type: "string",
            display: "Do you like fried eggs?",
          },
          operator: "is",
          type: "Value",
          value: "true",
          display: "true",
        },
      },
    ],
  },
};

const nestedCondition = {
  name: "likesFriedAndScrambledEggs",
  displayName: "Favourite egg is fried and scrambled",
  value: {
    conditions: [
      {
        conditionName: "likesScrambledEggs",
        conditionDisplayName: "likes scrambled eggs",
      },
      { coordinator: "and", ...objectCondition },
    ],
  },
};

test("conditionsByType", () => {
  const conditions = [stringCondition, objectCondition, nestedCondition];
  expect(conditionsByType(conditions)).toEqual({
    string: [stringCondition],
    nested: [nestedCondition],
    object: [objectCondition],
  });
});
