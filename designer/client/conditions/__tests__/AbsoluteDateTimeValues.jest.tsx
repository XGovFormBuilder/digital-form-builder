import { render } from "@testing-library/react";
import {
  findInputValue,
  typeIntoInput,
} from "../../../test/helpers/react-testing-library-utils";
import React from "react";
import { AbsoluteDateTimeValues } from "../AbsoluteDateTimeValues";

describe("AbsoluteDateTimeValues", () => {
  afterEach(() => jest.resetAllMocks());

  it("renders out a date that's passed to it", async () => {
    const d = new Date("2020-01-31T12:10:35Z");
    render(<AbsoluteDateTimeValues updateValue={jest.fn()} value={d} />);
    expect(await findInputValue("yyyy")).toEqual("2020");
    expect(await findInputValue("MM")).toEqual("1");
    expect(await findInputValue("dd")).toEqual("31");
  });

  it("renders out a time that's passed to it", async () => {
    const d = new Date("2020-01-31T12:10:35Z");
    render(<AbsoluteDateTimeValues updateValue={jest.fn()} value={d} />);
    expect(await findInputValue("HH")).toEqual("12");
    expect(await findInputValue("mm")).toEqual("10");
  });

  it("calls the updateValue prop if a valid date and time are entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateTimeValues updateValue={updateValue} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    await typeIntoInput("HH", "10");
    await typeIntoInput("mm", "57");
    const d = updateValue.mock.calls.pop()[0];
    expect(d.toISOString()).toEqual("2020-04-26T10:57:00.000Z");
  });

  it("calls the updateValue prop if an existing valid date and time are edited", async () => {
    const updateValue = jest.fn();
    const d = new Date("2020-01-31T12:10:35Z");
    render(<AbsoluteDateTimeValues updateValue={updateValue} value={d} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    await typeIntoInput("HH", "10");
    await typeIntoInput("mm", "57");
    const newDate = updateValue.mock.calls.pop()[0];
    expect(newDate.toISOString()).toEqual("2020-04-26T10:57:00.000Z");
  });

  it("doesn't call the updateValue prop if a valid date and time are not entered", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateTimeValues updateValue={updateValue} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    await typeIntoInput("HH", "40");
    expect(updateValue).not.toHaveBeenCalled();
  });

  it("allows a zero value for hours", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateTimeValues updateValue={updateValue} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    await typeIntoInput("HH", "0");
    await typeIntoInput("mm", "57");
    const d = updateValue.mock.calls.pop()[0];
    expect(d.toISOString()).toEqual("2020-04-26T00:57:00.000Z");
  });

  it("allows a zero value for minutes", async () => {
    const updateValue = jest.fn();
    render(<AbsoluteDateTimeValues updateValue={updateValue} />);
    await typeIntoInput("yyyy", "2020");
    await typeIntoInput("MM", "4");
    await typeIntoInput("dd", "26");
    await typeIntoInput("HH", "14");
    await typeIntoInput("mm", "0");
    const d = updateValue.mock.calls.pop()[0];
    expect(d.toISOString()).toEqual("2020-04-26T14:00:00.000Z");
  });
});
