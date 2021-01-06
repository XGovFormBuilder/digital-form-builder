import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AbsoluteDateTimeValues } from "../AbsoluteDateTimeValues";

const findInput = async (label) =>
  (await screen.findByLabelText(label)) as HTMLInputElement;

const findInputValue = async (label) => {
  const input = (await screen.findByLabelText(label)) as HTMLInputElement;
  return input.value;
};

const typeIntoInput = async (label, value) => {
  userEvent.type(await findInput(label), value);
};

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
    // look for the second call to the spy, because the first will be made
    // when the first valid digit is typed in the 'mm' input ie '5'
    const d = updateValue.mock.calls[1][0];
    expect(d.toISOString()).toEqual("2020-04-26T10:57:00.000Z");
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
    // look for the second call to the spy, because the first will be made
    // when the first valid digit is typed in the 'mm' input ie '5'
    const d = updateValue.mock.calls[1][0];
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
    const d = updateValue.mock.calls[0][0];
    expect(d.toISOString()).toEqual("2020-04-26T14:00:00.000Z");
  });
});
