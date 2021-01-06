import { tryParseInt, isInt } from "../inline-condition-helpers";

describe("tryParseInt", () => {
  it("it returns a valid integer if one can be parsed", () => {
    const result = tryParseInt("2020");
    expect(result).toEqual(2020);
  });

  it("it returns undefined if a valid integer can't be parsed", () => {
    const result = tryParseInt("");
    expect(result).toBeUndefined();
  });
});

describe("isInt", () => {
  it("it returns true for a valid integer", () => {
    const result = isInt("2020");
    expect(result).toEqual(true);
  });

  it("it returns false if not a valid integer", () => {
    const result = isInt("");
    expect(result).toEqual(false);
  });
});
