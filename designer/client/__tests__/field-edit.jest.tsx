import React from "react";
import { render } from "@testing-library/react";
import { FieldEdit } from "../field-edit";
import { simplePageMock } from "./helpers/mocks";
import { RenderWithContextAndDataContext } from "./helpers/renderers";

describe("Field edit", () => {
  const mockData = simplePageMock();
  let stateProps;
  let page;

  beforeEach(() => {
    stateProps = {
      component: {
        type: "UkAddressField",
        name: "UkAddressField",
        options: {},
      },
    };

    page = render(
      <RenderWithContextAndDataContext
        stateProps={stateProps}
        mockData={mockData}
      >
        <FieldEdit />
      </RenderWithContextAndDataContext>
    );
  });

  test("helpTextField should display display correct title", () => {
    const text = "Help text (optional)";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("helpTextField should display display correct helpText", () => {
    const text = "Enter the description to show for this field";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("hideOptionalTextOption should display display correct title", () => {
    const text = "Hide '(optional)' text";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("hideOptionalTextOption should display display correct helpText", () => {
    const text =
      "Tick this box if you do not want the title to indicate that this field is optional";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("hideTitleOption should display display correct title", () => {
    const text = "Hide title";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("hideTitleOption should display display correct helpText", () => {
    const text =
      "Tick this box if you do not want the title to show on the page";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("titleField should display display correct title", () => {
    const text = "Title";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("titleField should display display correct helpText", () => {
    const text = "Enter the name to show for this field";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("componentOptionalOption should display display correct title", () => {
    const text = "Make UK address field optional";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("componentOptionalOption should display display correct helpText", () => {
    const text =
      "Tick this box if users do not need to complete this field to progress through the form";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("componentNameField should display display correct title", () => {
    const text = "Component name";
    expect(page.getByText(text)).toBeInTheDocument();
  });

  test("componentNameField should display display correct helpText", () => {
    const text =
      "This is generated automatically and does not show on the page. Only change it if you are using an integration that requires you to, for example GOV.UK Notify. It must not contain spaces.";
    expect(page.getByText(text)).toBeInTheDocument();
  });
});
