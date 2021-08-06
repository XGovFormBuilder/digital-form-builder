import { isEmpty } from "../helpers";

test("isEmpty returns the correct value", () => {
  // @ts-ignore
  expect(isEmpty(1)).toBeFalsy();
  // @ts-ignore
  expect(isEmpty(0)).toBeFalsy();
  // @ts-ignore
  expect(isEmpty(-0)).toBeFalsy();
  expect(isEmpty("boop")).toBeFalsy();

  expect(isEmpty("")).toBeTruthy();
  expect(isEmpty(``)).toBeTruthy();
  expect(isEmpty(undefined)).toBeTruthy();
});
