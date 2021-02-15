import React from "react";
import { initI18n } from "../i18n";
import { render } from "@testing-library/react";
import PageCreate from "../page-create";

describe("page create", () => {
  initI18n();

  describe("Page create fields fields", () => {
    let props;
    let textFieldEditPage;

    beforeEach(() => {
      props = {
        path: "/some-path",
        data: {
          sections: [],
          pages: [],
        },
      };

      textFieldEditPage = render(<PageCreate {...props} />);
    });

    test("should display page type", () => {
      const text = "Page type";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display page type help text", () => {
      const text =
        "Select a Start Page to start a form, a Question Page to request information, and a Summary Page at the end of a section or form. For example, use a Summary to let users check their answers to questions before they submit the form.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display link from title", () => {
      const text = "Page type";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display link from help text", () => {
      const text = "Add a link to this page from a different page in the form.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display page title's title", () => {
      const text = "Page title";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display path title", () => {
      const text = "Path";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display path help text", () => {
      const text =
        "Appears in the browser path. The value you enter in the page title field automatically populates the path title. To override it, enter your own path name, relevant to the page, and use lowercase text and hyphens between words. For example, '/personal-details'.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display section option title", () => {
      const text = "Section (optional)";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });

    test("should display section option help text", () => {
      const text =
        "Use sections to split a form. For example, to add a section per applicant. The section title appears above the page title. However, if these titles are the same, the form will only show the page title.";
      expect(textFieldEditPage.getByText(text)).toBeInTheDocument();
    });
  });
});
