import React from "react";
import { render, cleanup, screen } from "@testing-library/react";
import { ErrorMessage } from "..";

describe("ErrorMessage component", () => {
  afterEach(cleanup);

  it("renders children text", async () => {
    render(<ErrorMessage className="123">Error 123</ErrorMessage>);
    expect(screen.findByText("Error 123")).toBeDefined();
  });

  it("passed down className", async () => {
    const { container } = render(
      <ErrorMessage className="123">Error 123</ErrorMessage>
    );
    expect(container.firstChild).toHaveClass("123");
  });

  it("renders hidden accessibility error span", () => {
    render(<ErrorMessage className="123">Error 123</ErrorMessage>);
    expect(screen.getByText("Error:")).toHaveClass("govuk-visually-hidden");
  });
});
