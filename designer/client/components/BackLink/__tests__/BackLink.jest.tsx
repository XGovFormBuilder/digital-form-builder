import React from "react";

import { BackLink } from "../BackLink";
import { render } from "@testing-library/react";

describe("BackLink Component", () => {
  test("it renders correctly", () => {
    const backLink = render(<BackLink>Go Back</BackLink>);
    expect(backLink.getByText("Go Back")).toBeInTheDocument();
  });

  test("it passes href prop", () => {
    const backLink = render(<BackLink href="test">Go Back</BackLink>);
    expect(backLink).toHaveAttribute("href", "test");
  });

  test("it passes onClick prop", () => {
    const onClick = jest.fn();
    const backLink = render(<BackLink onClick={onClick}>Go Back</BackLink>);
    backLink.getByText("Go Back").click();
    expect(onClick).toHaveBeenCalledTimes(0);
  });
});
