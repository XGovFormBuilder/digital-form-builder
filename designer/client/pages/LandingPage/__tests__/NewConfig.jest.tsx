import React from "react";
import { NewConfig } from "../NewConfig";
import {
  render,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  server,
  rest,
  mockedFormConfigurations,
} from "../../../../test/testServer";

describe("Newconfig", () => {
  afterEach(() => jest.resetAllMocks());
  afterEach(cleanup);

  test("new configuration is submitted correctly", async () => {
    let postBodyMatched = false;
    server.use(
      rest.post("/api/new", (req, res, ctx) => {
        // @ts-ignore
        postBodyMatched =
          req.body.name === "test-form-a" && req.body.selected.Key === "New";
        return res(ctx.json({ id: "somekey", previewUrl: "" }));
      })
    );
    const push = jest.fn();
    const history = { push: push };

    render(<NewConfig history={history} />);
    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Test Form A" },
    });
    fireEvent.click(screen.getByText("Next"));
    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(push).toBeCalledWith("designer/somekey");

    expect(postBodyMatched).toBe(true);
  });

  test("it will not submit when alreadyExistsError", async () => {
    let apiCalled = false;
    server.use(
      rest.post("/api/new", (req, res, ctx) => {
        apiCalled = true;
        return res(ctx.json({ id: "somekey", previewUrl: "" }));
      })
    );
    const push = jest.fn();
    const history = { push: push };

    render(<NewConfig history={history} />);
    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "My feedback form" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(apiCalled).toBeFalsy();
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
  });
});
