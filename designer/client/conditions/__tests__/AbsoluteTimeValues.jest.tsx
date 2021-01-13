import { render } from "@testing-library/react";
import {
  findInputValue,
  typeIntoInput,
} from "../../../test/helpers/react-testing-library-utils";
import React from "react";
import { AbsoluteTimeValues } from "../AbsoluteTimeValues";

describe("AbsoluteTimeValues", () => {
  afterEach(() => jest.resetAllMocks());

  it("renders out a time that's passed to it", async () => {
    render(
      <AbsoluteTimeValues
        updateValue={jest.fn()}
        value={{ hour: 0, minute: 34 }}
      />
    );
    expect(await findInputValue("HH")).toEqual("0");
    expect(await findInputValue("mm")).toEqual("34");
  });

  it("calls the updateValue prop if a valid time is entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteTimeValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("HH", "14");
    await typeIntoInput("mm", "20");
    expect(updateValue).toHaveBeenCalledWith({ hour: 14, minute: 20 });
  });

  it("calls the updateValue prop if an existing valid time is edited", async () => {
    const updateValue = jest.fn();
    render(
      <AbsoluteTimeValues
        updateValue={updateValue}
        value={{ hour: 10, minute: 12 }}
      />
    );
    await typeIntoInput("HH", "14");
    await typeIntoInput("mm", "20");
    expect(updateValue).toHaveBeenCalledWith({ hour: 14, minute: 20 });
  });

  it("doesn't call the updateValue prop if a minutes value is not entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteTimeValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("HH", "");
    await typeIntoInput("mm", "20");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("doesn't call the updateValue prop if an hours value is not entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteTimeValues updateValue={updateValue} value={{}} />);
    await typeIntoInput("HH", "3");
    await typeIntoInput("mm", "");
    expect(updateValue).not.toHaveBeenCalled();
  });
});
