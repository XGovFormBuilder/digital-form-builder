import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PageEdit from "../page-edit";
import { DataContext } from "../context";

const sections = [
  { name: "badger", title: "Badger" },
  { name: "personalDetails", title: "Personal Details" },
];

const renderPageEdit = (page) => {
  const data = { pages: [page], sections };
  return render(
    <DataContext.Provider value={{ data, save: jest.fn() }}>
      <PageEdit page={page} />
    </DataContext.Provider>
  );
};

const optionsOf = (select: HTMLElement) =>
  Array.from((select as HTMLSelectElement).options).map(({ value, text }) => ({
    value,
    text,
  }));

const pageTypeOptions = [
  { value: "", text: "Question page" },
  { value: "./pages/start.js", text: "Start page" },
  { value: "./pages/summary.js", text: "Summary page" },
  { value: "CheckpointSummaryPage", text: "Non-submitting Summary Page" },
];

const sectionOptions = [
  { value: "", text: "" },
  { value: "badger", text: "Badger" },
  { value: "personalDetails", text: "Personal Details" },
];

test("Renders a form with the correct initial inputs", () => {
  renderPageEdit({
    path: "/1",
    title: "My first page",
    section: "badger",
    controller: "./pages/start.js",
  });

  const pageType = screen.getByLabelText("Page type");
  expect(optionsOf(pageType)).toEqual(pageTypeOptions);
  expect(pageType).toHaveValue("./pages/start.js");

  expect(screen.getByLabelText("Page title")).toHaveValue("My first page");
  expect(screen.getByLabelText("Path")).toHaveValue("/1");

  const section = screen.getByLabelText("Section (optional)");
  expect(optionsOf(section)).toEqual(sectionOptions);
  expect(section).toHaveValue("badger");

  // The Duplicate button only shows with its feature flag on.
  expect(
    screen.getAllByRole("button").map((button) => button.textContent)
  ).toEqual(["Save", "Delete"]);
});

test("Renders a form with the correct initial inputs when no section or controller is set", () => {
  renderPageEdit({ path: "/1", title: "My first page" });

  expect(screen.getByLabelText("Page type")).toHaveValue("");
  expect(screen.getByLabelText("Path")).toHaveValue("/1");
  expect(screen.getByLabelText("Section (optional)")).toHaveValue("");
});

test("updating the title changes the path if the path is the auto-generated one", () => {
  renderPageEdit({ path: "/my-first-page", title: "My first page" });

  const title = screen.getByLabelText("Page title");
  userEvent.clear(title);
  userEvent.type(title, "New Page");

  expect(screen.getByLabelText("Path")).toHaveValue("/new-page");
});

test("changing the section causes the new section to be selected", () => {
  renderPageEdit({ path: "/1", title: "My first page" });

  const section = screen.getByLabelText("Section (optional)");
  userEvent.selectOptions(section, "personalDetails");

  expect(section).toHaveValue("personalDetails");
});

test("changing the controller causes the new controller to be selected", () => {
  renderPageEdit({ path: "/1", title: "My first page" });

  const pageType = screen.getByLabelText("Page type");
  userEvent.selectOptions(pageType, "./pages/summary.js");

  expect(pageType).toHaveValue("./pages/summary.js");
});
