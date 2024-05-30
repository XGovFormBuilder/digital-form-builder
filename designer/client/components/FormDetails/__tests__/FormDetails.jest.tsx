import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { FormDetails } from "../FormDetails";
import { server, mockedFormConfigurations } from "../../../../test/testServer";
import { DataContext } from "../../../../client/context";

describe("FormDetails", () => {
  let providerProps;

  beforeAll(() => server.listen());

  beforeEach(() => {
    providerProps = {
      data: {
        name: "Default Title",
      },
      save: jest.fn(),
    };
  });

  afterEach(() => {
    server.resetHandlers();
    jest.resetAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  function renderWithDataContext(ui, { providerProps, ...renderOptions }) {
    return render(
      <DataContext.Provider value={providerProps}>{ui}</DataContext.Provider>,
      renderOptions
    );
  }

  function findSaveButton() {
    return screen.getByText("Save") as HTMLButtonElement;
  }

  describe("Title", () => {
    it("updates the form title", () => {
      renderWithDataContext(<FormDetails />, {
        providerProps,
      });

      const input = screen.getByLabelText("Title") as HTMLInputElement;
      const saveButton = findSaveButton();

      fireEvent.change(input, { target: { value: "Test Form" } });
      expect(input.value).toBe("Test Form");

      fireEvent.click(saveButton);
      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        name: "Test Form",
        phaseBanner: { phase: undefined },
      });
    });
  });

  describe("Phase banner", () => {
    it("sets alpha phase", () => {
      renderWithDataContext(<FormDetails />, {
        providerProps,
      });

      const alphaRadio = screen.getByLabelText("Alpha") as HTMLInputElement;
      expect(alphaRadio.checked).toEqual(false);

      fireEvent.click(alphaRadio, { target: { value: "alpha" } });
      expect(alphaRadio.checked).toEqual(true);

      const saveButton = findSaveButton();
      fireEvent.click(saveButton);

      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        name: "Default Title",
        phaseBanner: { phase: "alpha" },
      });
    });

    it("sets beta phase", () => {
      renderWithDataContext(<FormDetails />, {
        providerProps,
      });

      const noneRadio = screen.getByLabelText("None") as HTMLInputElement;
      expect(noneRadio.checked).toEqual(true);

      const betaRadio = screen.getByLabelText("beta") as HTMLInputElement;
      expect(betaRadio.checked).toEqual(false);

      fireEvent.click(betaRadio, { target: { value: "beta" } });
      expect(betaRadio.checked).toEqual(true);

      const saveButton = findSaveButton();
      fireEvent.click(saveButton);
      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        name: "Default Title",
        phaseBanner: { phase: "Beta" },
      });
    });

    it("sets none phase", () => {
      renderWithDataContext(<FormDetails />, {
        providerProps: {
          ...providerProps,
          data: {
            ...providerProps.data,
            phaseBanner: { phase: "alpha" },
          },
        },
      });

      const alphaRadio = screen.getByLabelText("Alpha") as HTMLInputElement;
      expect(alphaRadio.checked).toEqual(true);

      const noneRadio = screen.getByLabelText("None") as HTMLInputElement;
      expect(noneRadio.checked).toEqual(false);

      fireEvent.click(noneRadio);
      expect(noneRadio.checked).toEqual(true);

      const saveButton = findSaveButton();
      fireEvent.click(saveButton, { target: { value: "" } });
      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        name: "Default Title",
        phaseBanner: { phase: undefined },
      });
    });
  });

  describe("Feedback form", () => {
    it("sets `Yes` feedback form", () => {
      renderWithDataContext(<FormDetails />, {
        providerProps,
      });

      const yesFeedbackRadio = screen.getByLabelText("yes") as HTMLInputElement;
      const noFeedbackRadio = screen.getByLabelText("no") as HTMLInputElement;

      expect(yesFeedbackRadio.checked).toEqual(false);
      expect(noFeedbackRadio.checked).toEqual(true);

      fireEvent.click(yesFeedbackRadio);
      expect(yesFeedbackRadio.checked).toEqual(true);

      const saveButton = findSaveButton();
      fireEvent.click(saveButton);
      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        feedback: {
          feedbackForm: true,
          url: "",
        },
        name: "Default Title",
        phaseBanner: { phase: undefined },
      });
    });

    it("sets `No` feedback form", () => {
      renderWithDataContext(<FormDetails />, {
        providerProps: {
          ...providerProps,
          data: {
            ...providerProps.data,
            feedback: {
              feedbackForm: true,
            },
          },
        },
      });

      const yesFeedbackRadio = screen.getByLabelText("yes") as HTMLInputElement;
      const noFeedbackRadio = screen.getByLabelText("no") as HTMLInputElement;

      expect(yesFeedbackRadio.checked).toEqual(true);
      expect(noFeedbackRadio.checked).toEqual(false);

      fireEvent.click(noFeedbackRadio);
      expect(noFeedbackRadio.checked).toEqual(true);

      const saveButton = findSaveButton();
      fireEvent.click(saveButton);
      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        name: "Default Title",
        feedback: {
          feedbackForm: false,
        },
        phaseBanner: { phase: undefined },
      });
    });

    it("displays correct feedback form list", async () => {
      renderWithDataContext(<FormDetails />, {
        providerProps,
      });

      const myFeedbackFromOption = (await screen.findByText(
        mockedFormConfigurations[1].DisplayName
      )) as HTMLInputElement;
      const notFeedbackFormOption = (await screen.queryByText(
        mockedFormConfigurations[0].DisplayName
      )) as HTMLInputElement;

      expect(myFeedbackFromOption).toBeTruthy();
      expect(notFeedbackFormOption).toBeFalsy();
    });

    it("sets correct feedback url when target feedback form is selected", async () => {
      renderWithDataContext(<FormDetails />, {
        providerProps,
      });
      const feedbackFromKey = mockedFormConfigurations[1].Key;
      const targetFeedbackForm = await screen.findByTestId(
        "target-feedback-form"
      );
      fireEvent.change(targetFeedbackForm, {
        target: { value: feedbackFromKey },
      });
      const saveButton = findSaveButton();
      fireEvent.click(saveButton);
      expect(providerProps.save.mock.calls[0][0]).toMatchObject({
        feedback: {
          url: `/${feedbackFromKey}`,
        },
      });
    });
  });
});
