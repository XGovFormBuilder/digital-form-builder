import React from "react";
import { render } from "@testing-library/react";
import { initI18n } from "../../../i18n";
import { ComponentCreateList } from "../ComponentCreateList";

initI18n();

describe("ComponentCreateList", () => {
  test("should match snapshot", async () => {
    const onSelectComponent = jest.fn();
    const { asFragment } = render(
      <ComponentCreateList onSelectComponent={onSelectComponent} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
