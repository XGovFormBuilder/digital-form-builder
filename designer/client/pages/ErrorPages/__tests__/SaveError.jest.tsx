import React from "react";
import { SaveError } from "../SaveError";
import {
  render,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";

describe("SaveErrorPage", () => {
  afterEach(() => jest.resetAllMocks());
  afterEach(cleanup);

  test("should render correcty", async () => {
    const push = jest.fn();
    const history = { push: push };
    const location = { state: { id: "testid" } };
    const { asFragment } = render(
      <SaveError history={history} location={location} />
    );
    expect(await screen.findByText("Back to Designer")).toBeInTheDocument();
    //TODO assert other texts
    //TODO assert anchor tag urls
  });

  test("back link should take back to designer page", async () => {
    const push = jest.fn();
    const history = { push: push };
    const location = { state: { id: "testid" } };
    render(<SaveError history={history} location={location} />);
    expect(await screen.findByText(/Back to Designer/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Back to Designer"));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toBeCalledWith("designer/testid");
  });
});
