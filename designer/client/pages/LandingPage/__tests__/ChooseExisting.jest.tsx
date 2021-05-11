import React from "react";
import { ChooseExisting } from "../ChooseExisting";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  server,
  rest,
  mockedFormConfigurations,
} from "../../../../test/testServer";

describe("ChooseExisting", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("no existing configurations", async () => {
    server.resetHandlers(
      rest.get("/api/configurations", (_req, res, ctx) => {
        return res(ctx.json([]));
      })
    );

    const push = jest.fn();
    const history = { push: push };
    const { asFragment } = render(<ChooseExisting history={history} />);
    expect(await screen.findByText(/Form name/i)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  test("with existing configurations", async () => {
    const push = jest.fn();
    const history = { push: push };
    const { asFragment } = render(<ChooseExisting history={history} />);
    expect(await screen.findByText(/Form name/i)).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  test("should post to server and redirect to a new page on choosing a form", async () => {
    server.use(
      rest.post("/api/new", (req, res, ctx) => {
        return res(ctx.json({ id: "somekey", previewUrl: "" }));
      })
    );
    const push = jest.fn();
    const history = { push: push };

    render(<ChooseExisting history={history} />);
    expect(await screen.findByText(/Form name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(mockedFormConfigurations[0].DisplayName));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toBeCalledWith("/designer/somekey");
  });
});
