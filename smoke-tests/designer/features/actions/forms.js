const { formRunner } = require("../pageobjects/pages");
const addressData = require("../../data/addressData");

class Forms {
  cgTest() {
    formRunner.selectRadio("Yes");
    formRunner.ukAddress(addressData);
    formRunner.inputField(
      "What date was the vehicle registered at this address?",
      "01012020"
    );
    formRunner.selectCheckbox("Bath");
    formRunner.selectCheckbox("Bristol");
    formRunner.continueButton.click();
    formRunner.selectFromList("BMW");
    formRunner.inputField("Vehicle Model", "740");
    formRunner.inputDate("22", "03", "2021");
    formRunner.selectRadio("Hydrogen", false);
    formRunner.textBox(
      "Has the vehicle been modified in any way?",
      "I've turned it into a spaceship capable of interstellar travel"
    );
    formRunner.inputField(
      "How many people in your household drive this vehicle?",
      "3"
    );
    formRunner.inputField("Full name of the main driver", "Juan Pablo Montoya");
    formRunner.inputField("Contact number", "07777888999");
    formRunner.continueButton.click();
    formRunner.inputField("Your email address", "testing@testing.com");
    formRunner.inputField("Please enter the current time?", "1031");
    formRunner.continueButton.click();
  }

  reportATerrorist() {
    formRunner.selectRadio("Yes, I do have a link");
    formRunner.textBox("https://nodejs.org/en/");
    formRunner.selectRadio("No, I don't have evidence");
    formRunner.textBox("File upload is not yet finished!!");
  }
}

module.exports = new Forms();
