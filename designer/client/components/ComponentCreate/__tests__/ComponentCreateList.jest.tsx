import React from "react";
import { render } from "@testing-library/react";
import { ComponentCreateList } from "../ComponentCreateList";

describe("ComponentCreateList", () => {
  test("should match snapshot", async () => {
    const onSelectComponent = jest.fn();
    const { asFragment } = render(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
