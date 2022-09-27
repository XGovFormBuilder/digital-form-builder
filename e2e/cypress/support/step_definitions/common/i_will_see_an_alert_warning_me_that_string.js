Then("I will see an alert warning me that {string}", () => {
  cy.on("window:confirm", (text) => {
    console.log("text", text);
    expect(text).to.contains("This is an alert!");
  });
});