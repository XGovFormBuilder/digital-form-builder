import React from "react";
import { render, cleanup } from "@testing-library/react";
import { ErrorMessage } from "..";

describe("ErrorMessage component", () => {
  afterEach(cleanup);

  it("matches snapshot", async () => {
    const { debug, asFragment } = render(
      <ErrorMessage className="123">Error 123</ErrorMessage>
    );
    debug();
    expect(asFragment()).toMatchSnapshot();
  });
});
