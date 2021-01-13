import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const findInput = async (label) =>
  (await screen.findByLabelText(label)) as HTMLInputElement;

export const findInputValue = async (label) => {
  const input = (await screen.findByLabelText(label)) as HTMLInputElement;
  return input.value;
};

export const typeIntoInput = async (label, value) => {
  const input = await findInput(label);
  userEvent.clear(input);
  userEvent.type(input, value);
};
