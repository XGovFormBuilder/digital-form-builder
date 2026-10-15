import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PageCreate from "../page-create";
import { DataContext } from "../context";

describe("page create fields text", () => {
  test("displays field titles and help texts", () => {
    const props = {
      path: "/some-path",
      data: {
        sections: [],
        pages: [],
      },
    };

    const { getByText } = render(<PageCreate {...props} />);
    expect(getByText("Page type")).toBeInTheDocument();
    expect(
      getByText(
        "Select a Start Page to start a form, a Question Page to request information, and a Summary Page at the end of a section or form. For example, use a Summary to let users check their answers to questions before they submit the form."
      )
    ).toBeInTheDocument();
    expect(getByText("Link from (optional)")).toBeInTheDocument();
    expect(
      getByText("Add a link to this page from a different page in the form.")
    ).toBeInTheDocument();
    expect(getByText("Page title")).toBeInTheDocument();
    expect(getByText("Path")).toBeInTheDocument();
    expect(
      getByText(
        "Appears in the browser path. The value you enter in the page title field automatically populates the path name. To override it, enter your own path name, relevant to the page, and use lowercase text and hyphens between words. For example, '/personal-details'."
      )
    ).toBeInTheDocument();
    expect(getByText("Section (optional)")).toBeInTheDocument();
    expect(
      getByText(
        "Use sections to split a form. For example, to add a section per applicant. The section title appears above the page title. However, if these titles are the same, the form will only show the page title."
      )
    ).toBeInTheDocument();
  });
});

describe("page create form", () => {
  const data = {
    pages: [
      { path: "/1", title: "Page 1", next: [] },
      { path: "/2", title: "Page 2", next: [] },
    ],
    sections: [
      { name: "badger", title: "Badger" },
      { name: "personalDetails", title: "Personal Details" },
    ],
    conditions: [],
    lists: [],
  };

  const renderPageCreate = ({ save = jest.fn(), onCreate = jest.fn() } = {}) =>
    render(
      <DataContext.Provider value={{ data, save }}>
        <PageCreate onCreate={onCreate} />
      </DataContext.Provider>
    );

  const optionsOf = (select: HTMLElement) =>
    Array.from((select as HTMLSelectElement).options).map(
      ({ value, text }) => ({ value, text })
    );

  const noConditionFieldsHint =
    "You cannot add a condition as no components are available. Create a component on a page in the form. You can then add a condition.";

  const fillInForm = () => {
    userEvent.selectOptions(
      screen.getByLabelText("Page type"),
      "./pages/start.js"
    );
    userEvent.type(screen.getByLabelText("Page title"), "New Page");
    userEvent.selectOptions(
      screen.getByLabelText("Link from (optional)"),
      "/2"
    );
    userEvent.selectOptions(
      screen.getByLabelText("Section (optional)"),
      "personalDetails"
    );
  };

  test("Renders a form with the appropriate initial inputs", () => {
    renderPageCreate();

    const pageType = screen.getByLabelText("Page type");
    expect(optionsOf(pageType)).toEqual([
      { value: "", text: "Question Page" },
      { value: "./pages/start.js", text: "Start Page" },
      { value: "./pages/summary.js", text: "Summary Page" },
      { value: "CheckpointSummaryPage", text: "Non-submitting Summary Page" },
    ]);
    expect(pageType).toHaveValue("");

    expect(screen.getByLabelText("Page title")).toHaveValue("");
    expect(screen.getByLabelText("Path")).toHaveValue("/");

    const linkFrom = screen.getByLabelText("Link from (optional)");
    expect(optionsOf(linkFrom)).toEqual([
      { value: "", text: "" },
      { value: "/1", text: "/1" },
      { value: "/2", text: "/2" },
    ]);
    expect(linkFrom).toHaveValue("");

    const section = screen.getByLabelText("Section (optional)");
    expect(optionsOf(section)).toEqual([
      { value: "", text: "" },
      { value: "badger", text: "Badger" },
      { value: "personalDetails", text: "Personal Details" },
    ]);
    expect(section).toHaveValue("");

    // The conditions picker only appears once "Link from" is set.
    expect(screen.queryByText(noConditionFieldsHint)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("Inputs remain populated when amending other fields", () => {
    renderPageCreate();

    fillInForm();

    expect(screen.getByLabelText("Page type")).toHaveValue("./pages/start.js");
    expect(screen.getByLabelText("Page title")).toHaveValue("New Page");
    expect(screen.getByLabelText("Link from (optional)")).toHaveValue("/2");
    expect(screen.getByLabelText("Section (optional)")).toHaveValue(
      "personalDetails"
    );
    expect(screen.getByText(noConditionFieldsHint)).toBeInTheDocument();
  });

  test("editing the fields and submitting persists changes correctly", async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    const onCreate = jest.fn();
    renderPageCreate({ save, onCreate });

    fillInForm();
    userEvent.click(screen.getByRole("button", { name: "Save" }));

    const expectedPage = {
      path: "/new-page",
      title: "New Page",
      section: "personalDetails",
      controller: "./pages/start.js",
      components: [],
      next: [],
    };
    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({ value: expectedPage })
    );

    expect(save).toHaveBeenCalledTimes(1);
    const saved = save.mock.calls[0][0];
    expect(saved.pages).toContainEqual(expectedPage);
    expect(saved.pages.find((page) => page.path === "/2").next).toEqual([
      { path: "/new-page" },
    ]);
  });

  test("editing the title automatically generates a path", () => {
    renderPageCreate();

    userEvent.type(screen.getByLabelText("Page title"), "New Page");

    expect(screen.getByLabelText("Path")).toHaveValue("/new-page");
  });
});
