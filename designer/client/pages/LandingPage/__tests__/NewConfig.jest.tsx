import React from "react";
import { NewConfig } from "../NewConfig";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { server, rest } from "../../../../test/testServer";
import { MemoryRouter } from "react-router-dom";

describe("Newconfig", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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
    render(<NewConfig />, { wrapper: MemoryRouter });

    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "My feedback form" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(apiCalled).toBeFalsy();
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
    expect(
      await screen.findAllByText(/A form with this name already exists/i)
    ).toHaveLength(2);
  });

  test("Enter form name error shown correctly", async () => {
    render(<NewConfig />, { wrapper: MemoryRouter });

    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next"));
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
    expect(await screen.findAllByText(/Enter form name/i)).toHaveLength(2);
  });

  test("Form name with special characters results in error", async () => {
    let apiCalled = false;
    server.use(
      rest.post("/api/new", (req, res, ctx) => {
        apiCalled = true;
        return res(ctx.json({ id: "somekey", previewUrl: "" }));
      })
    );
    render(<NewConfig />, { wrapper: MemoryRouter });

    expect(
      await screen.findByText(/Enter a name for your form/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Visa & Form" },
    });
    fireEvent.click(screen.getByText("Next"));
    expect(apiCalled).toBeFalsy();
    expect(await screen.findByText(/There is a problem/i)).toBeInTheDocument();
    expect(
      await screen.findAllByText(
        /Form name should not contain special characters/i
      )
    ).toHaveLength(2);
  });
});
