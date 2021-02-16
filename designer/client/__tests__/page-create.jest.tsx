import React from "react";
import { render } from "@testing-library/react";
import PageCreate from "../page-create";

test("page create", () => {
  let props;

  props = {
    path: "/some-path",
    data: {
      sections: [],
      pages: [],
    },
  };

  const { getByText } = render(<PageCreate {...props} />);

  it("should display page type", () => {
    const text = "Page type";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display page type help text", () => {
    const text =
      "Select a Start Page to start a form, a Question Page to request information, and a Summary Page at the end of a section or form. For example, use a Summary to let users check their answers to questions before they submit the form.";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display link from title", () => {
    const text = "Page type";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display link from help text", () => {
    const text = "Add a link to this page from a different page in the form.";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display page title's title", () => {
    const text = "Page title";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display path title", () => {
    const text = "Path";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display path help text", () => {
    const text =
      "Appears in the browser path. The value you enter in the page title field automatically populates the path name. To override it, enter your own path name, relevant to the page, and use lowercase text and hyphens between words. For example, '/personal-details'.";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display section option title", () => {
    const text = "Section (optional)";
    expect(getByText(text)).toBeInTheDocument();
  });

  it("should display section option help text", () => {
    const text =
      "Use sections to split a form. For example, to add a section per applicant. The section title appears above the page title. However, if these titles are the same, the form will only show the page title.";
    expect(getByText(text)).toBeInTheDocument();
  });
});
