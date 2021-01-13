import { render } from "@testing-library/react";
import {
  findInputValue,
  typeIntoInput,
} from "../../../test/helpers/react-testing-library-utils";
import React from "react";
import { AbsoluteDateValues } from "../AbsoluteDateValues";

describe("AbsoluteDateValues", () => {
  afterEach(() => jest.resetAllMocks());

  it("renders out a date that's passed to it", async () => {
    render(
      <AbsoluteDateValues
        updateValue={jest.fn()}
        value={{ year: 1999, month: 12, day: 31 }}
      />
    );
    expect(await findInputValue("yyyy")).toEqual("1999");
    expect(await findInputValue("MM")).toEqual("12");
    expect(await findInputValue("dd")).toEqual("31");
  });

  it("calls the updateValue prop if a valid date is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    expect(updateValue).toHaveBeenCalledWith({ year: 2020, month: 4, day: 26 });
  });

  it("calls the updateValue prop if an existing date is edited", async () => {
    const updateValue = jest.fn();
    render(
      <AbsoluteDateValues
        updateValue={updateValue}
        value={{ year: 1999, month: 12, day: 31 }}
      />
    );
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    expect(updateValue).toHaveBeenCalledWith({ year: 2020, month: 4, day: 26 });
  });

  it("doesn't call the updateValue prop if an valid day is not entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "0");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if no day is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if no month is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "");
    await typeIntoInput("dd", "7");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if no year is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("yyyy", "");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "23");
    expect(updateValue).not.toHaveBeenCalled();
  });
});
