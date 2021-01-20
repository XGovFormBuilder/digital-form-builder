import React from "react";
import { ChooseExisting } from "../ChooseExisting";
import {
  render,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";

describe("ChooseExisting", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  afterEach(() => jest.resetAllMocks());
  afterEach(cleanup);

  test("no existing configurations", async () => {
    const i18n = jest.fn();
    const push = jest.fn();
    const history = { push: push };
    fetch.mockResponseOnce("");
    const { asFragment } = render(
      <ChooseExisting i18n={i18n} history={history} />
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/Form name/i)).toBeInTheDocument();
    expect(
      asFragment(<ChooseExisting i18n={i18n} history={history} />)
    ).toMatchSnapshot();
  });

  test("with existing configurations", async () => {
    const i18n = jest.fn();
    const push = jest.fn();
    const history = { push: push };
    fetch.mockResponseOnce(`[{"Key": "test", "DisplayName": "test", "feedbackForm": false},
     {"Key": "skl1", "DisplayName": "skl1", "feedbackForm": false}]`);
    const { asFragment } = render(
      <ChooseExisting i18n={i18n} history={history} />
    );
    expect(await screen.findByText(/Form name/i)).toBeInTheDocument();
    expect(
      asFragment(<ChooseExisting i18n={i18n} history={history} />)
    ).toMatchSnapshot();
  });

  it("should post to server and redirect to a new page on choosing a form", async () => {
    const i18n = jest.fn();
    const push = jest.fn();
    const history = { push: push };

    fetch
      .once(
        `[{"Key": "test", "DisplayName": "test", "feedbackForm": false},
          {"Key": "skl1", "DisplayName": "skl1", "feedbackForm": false}]`
      )
      .once(`{"id": "somekey","previewUrl": "http://localhost:3009"}`);

    render(<ChooseExisting i18n={i18n} history={history} />);
    expect(await screen.findByText(/Form name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText("skl1"));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toEqual("/api/new");
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toBeCalledWith("/designer/somekey");
  });
});
