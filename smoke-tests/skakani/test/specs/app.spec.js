import HomePage from "../pageobjects/home.page";

describe("homepage", function () {
  it("should display create a new form", function () {
    HomePage.open();
    console.log(HomePage.pageTitle);
    console.log(HomePage.pageText.getText());
    expect(HomePage.pageText).toBeDefined();
  });
});
