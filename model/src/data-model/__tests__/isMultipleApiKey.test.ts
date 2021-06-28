import { isMultipleApiKey } from "../types";

test("isMultipleApiKey correctly typeguards", () => {
  expect(isMultipleApiKey("abc")).toBeFalsy();
  expect(isMultipleApiKey({ test: "test_key" })).toBeTruthy();
  expect(isMultipleApiKey({ production: "production_key" })).toBeTruthy();
  expect(
    isMultipleApiKey({ test: "test_key", production: "production_key" })
  ).toBeTruthy();
});
