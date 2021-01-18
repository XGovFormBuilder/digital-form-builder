import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { FormDetails } from "../FormDetails";

import { initI18n } from "../../../i18n";
initI18n();

const mockedFormConfigurations = [
  {
    Key: "test",
    DisplayName: "test",
    feedbackForm: false,
  },
  {
    Key: "UKPrecgQUv",
    DisplayName: "My feedback form",
    feedbackForm: true,
  },
];

const server = setupServer(
  rest.get("/configurations", (_req, res, ctx) => {
    return res(ctx.json(mockedFormConfigurations));
  })
);

describe("FormDetails", () => {
  beforeAll(() => server.listen());

  afterEach(() => {
    server.resetHandlers();
    jest.resetAllMocks();
  });

  afterAll(() => {
    server.close();
  });

  describe("Title", () => {
    it("updates the form title");
  });

  describe("Phase banner", () => {
    it("sets alpha phase");
    it("sets beta phase");
    it("sets none phase");
  });

  describe("Feedback form", () => {
    it("sets `Yes` feedback form");
    it("hides feedback forms list when `Yes` feedback form");
    it("sets `NO` feedback form");
    it("shows feedback forms list when `No` feedback form");
    it("displays correct feedback form list");
  });

  //   it("async", async () => {
  //     await waitFor(() =>
  //       screen.findByText(mockedFormConfigurations[1].DisplayName)
  //     );

  //     debug();
  //     debug();
  //     expect(await findInputValue("form-title")).toEqual("1999");
  //     expect(await findInputValue("MM")).toEqual("12");
  //     expect(await findInputValue("dd")).toEqual("31");
  //   });
});
