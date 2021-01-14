// @ts-nocheck

import { FormConfiguration } from "../";

describe("Form configuration", () => {
  test("should return provided items if provided", () => {
    const underTest = new FormConfiguration(
      "My Key",
      "Display name",
      "Last modified",
      true
    );
    expect(underTest.Key).toEqual("My Key");
    expect(underTest.DisplayName).toEqual("Display name");
    expect(underTest.LastModified).toEqual("Last modified");
    expect(underTest.feedbackForm).toEqual(true);
  });

  test("should default Display name to key", () => {
    const underTest = new FormConfiguration("My Key");
    expect(underTest.DisplayName).toEqual("My Key");
  });

  test("should keep LastModified as undefined when not specified", () => {
    const underTest = new FormConfiguration("My Key");
    expect(underTest.LastModified).toEqual(undefined);
  });

  test("should default feedback to false when not provided", () => {
    const underTest = new FormConfiguration("My Key");
    expect(underTest.feedbackForm).toEqual(false);
  });

  test("should bork if no key provided", () => {
    expect(() => new FormConfiguration()).toThrow(Error);
  });
});
