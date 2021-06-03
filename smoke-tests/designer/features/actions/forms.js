const { formRunner } = require("../pageobjects/pages");
const formData = require("../../data/formData");

class Forms {
  runnerComponentsTest() {
    formRunner.selectRadio(formData.yesNo.answer);
    formRunner.inputUkAddress(formData.address);
    formRunner.inputField(
      formData.dateField.question,
      formData.dateField.answer
    );
    formRunner.selectCheckbox(formData.checkBox1.answer);
    formRunner.selectCheckbox(formData.checkBox2.answer);
    formRunner.continueButton.click();
    formRunner.selectFromList(formData.autoComp.answer);
    formRunner.inputField(
      formData.textField.question,
      formData.textField.answer
    );
    formRunner.inputDate(
      formData.dateParts.day,
      formData.dateParts.month,
      formData.dateParts.year
    );
    formRunner.selectRadio(formData.radio2.answer, false);
    formRunner.inputTextBox(formData.multiLine.answer);
    formRunner.inputField(
      formData.numberField.question,
      formData.numberField.answer
    );
    formRunner.inputField(
      formData.textField2.question,
      formData.textField2.answer
    );
    formRunner.inputField(
      formData.phoneNumber.question,
      formData.phoneNumber.answer
    );
    formRunner.continueButton.click();
    formRunner.inputField(
      formData.emailAddress.question,
      formData.emailAddress.answer
    );
    formRunner.continueButton.scrollIntoView();
    browser.keys("Tab");
    browser.keys("Enter");
    if (formRunner.pageTitle.getText() === "final steps") {
      browser.pause(500);
      browser.keys("Enter");
    }
  }

  reportATerrorist() {
    formRunner.selectRadio("Yes, I do have a link");
    formRunner.inputTextBox("https://nodejs.org/en/");
    formRunner.selectRadio("No, I don't have evidence");
    formRunner.inputTextBox("File upload is not yet finished!!");
  }

  getConditionEvaluationContext() {
    formRunner.selectRadio("Yes");
    formRunner.selectDropdownOption("1");
    formRunner.continueButton.click();
    formRunner.inputField("First name", "Applicant");
    formRunner.inputField("Surname", "Example");
    formRunner.continueButton.click();
    formRunner.inputField(
      "Address line 1",
      "4th Floor, Block C, The Soapworks"
    );
    formRunner.inputField("Address line 2", "Colgate Lane");
    formRunner.inputField("Town or city", "Manchester");
    formRunner.inputField("Postcode", "M5 3LZ");
    formRunner.continueButton.click();
    formRunner.inputField("Phone number", "1234567890");
    formRunner.inputField("Your email address", "developer@example.com");
    formRunner.continueButton.click();
    formRunner.continueButton.click();
  }
}

module.exports = new Forms();
