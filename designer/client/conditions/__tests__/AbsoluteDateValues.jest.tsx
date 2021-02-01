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
    expect(await findInputValue("Year")).toEqual("1999");
    expect(await findInputValue("Month")).toEqual("12");
    expect(await findInputValue("Day")).toEqual("31");
  });

  it("calls the updateValue prop if a valid date is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("Year", "2020");
    await typeIntoInput("Month", "4");
    await typeIntoInput("Day", "26");
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
    await typeIntoInput("Year", "2020");
    await typeIntoInput("Month", "4");
    await typeIntoInput("Day", "26");
    expect(updateValue).toHaveBeenCalledWith({ year: 2020, month: 4, day: 26 });
  });

  it("doesn't call the updateValue prop if an valid day is not entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("Year", "2020");
    await typeIntoInput("Month", "4");
    await typeIntoInput("Day", "0");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if no day is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("Year", "2020");
    await typeIntoInput("Month", "4");
    await typeIntoInput("Day", "");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if no month is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("Year", "2020");
    await typeIntoInput("Month", "");
    await typeIntoInput("Day", "7");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if no year is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("Year", "");
    await typeIntoInput("Month", "4");
    await typeIntoInput("Day", "23");
    expect(updateValue).not.toHaveBeenCalled();
  });
});
