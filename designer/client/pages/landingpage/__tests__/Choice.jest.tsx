import React from "react";
import { LandingChoice } from "../Choice";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";

describe("LandingChoice", () => {
  afterEach(() => jest.resetAllMocks());
  afterEach(cleanup);

  it("snapshot matches", () => {
    const i18n = jest.fn();
    const push = jest.fn();
    const history = { push: push };
    const { asFragment } = render(
      <LandingChoice i18n={i18n} history={history} />
    );
    expect(
      asFragment(<LandingChoice i18n={i18n} history={history} />)
    ).toMatchSnapshot();
  });

  it("should push /new to history if 'Create a new form' is selected", async () => {
    const i18n = jest.fn();
    const push = jest.fn();
    const history = { push: push };
    render(<LandingChoice i18n={i18n} history={history} />);
    fireEvent.click(screen.getByTitle("Next"));
    expect(push).toBeCalledWith("/new");
  });

  it("should push /choose-existing to history if 'Open an existing form' is selected", async () => {
    const i18n = jest.fn();
    const push = jest.fn();
    const history = { push: push };
    render(<LandingChoice i18n={i18n} history={history} />);
    fireEvent.click(screen.getByLabelText("Open an existing form"));
    fireEvent.click(screen.getByTitle("Next"));
    expect(push).toBeCalledWith("/choose-existing");
  });
});
