import React from "react";
import { render } from "@testing-library/react";
import { Autocomplete } from "../Autocomplete";
import { RenderWithContext } from "../../../__tests__/helpers/renderers";

describe("AutocompleteField", () => {
  let stateProps;
  let page;

  beforeEach(() => {
    stateProps = {
      component: {
        type: "AutocompleteField",
        name: "TestCssClass",
        options: {},
      },
    };

    page = render(
      <RenderWithContext stateProps={stateProps}>
        <Autocomplete />
      </RenderWithContext>
    );
  });

  test("should display display correct title", () => {
    const text = "Autocomplete";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("should display display correct helptext", () => {
    const text =
      "Add the autocomplete attribute to this field. For example, 'on' or 'given-name'.";
    expect(page.getByText(text)).toBeInTheDocument();
  });
});
