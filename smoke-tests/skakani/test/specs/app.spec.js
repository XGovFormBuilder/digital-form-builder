import HomePage from "../pageobjects/home.page";

describe("homepage", function () {
  it("should display create a new form", function () {
    HomePage.open();
    expect(HomePage.pageText).toHaveTextContaining("Create a new form");
  });
});
