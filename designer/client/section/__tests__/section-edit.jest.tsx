import React from "react";
import { render } from "@testing-library/react";
import { RenderWithContext } from "../../__tests__/helpers/renderers";
import SectionEdit from "../section-edit";

describe("Section edit fields", () => {
  test("should display titles and help texts", () => {
    const stateProps = {
      component: {
        type: "sectionFieldEdit",
        name: "sectionFieldEditClass",
        options: {},
      },
    };

    const { getByText } = render(
      <RenderWithContext stateProps={stateProps}>
        <SectionEdit />
      </RenderWithContext>
    );

    expect(getByText("Section title")).toBeInTheDocument();
    expect(
      getByText(
        "Appears above the page title. However, if these titles are the same, the form will only show the page title."
      )
    ).toBeInTheDocument();
    expect(getByText("Section name")).toBeInTheDocument();
    expect(
      getByText(
        "Automatically populated. It does not show on the page. You usually do not need to change it unless an integration requires it. It must not contain spaces."
      )
    ).toBeInTheDocument();
  });
});
