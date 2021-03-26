const { formRunner } = require("../pageobjects/pages");
const formData = require("../../data/formData");

class Forms {
  cgTest() {
    formRunner.selectRadio("Yes");
    formRunner.ukAddress(formData.address);
    formRunner.inputField(formData.input1.question, formData.input1.answer);
    formRunner.selectCheckbox(formData.checkBox1.answer);
    formRunner.selectCheckbox(formData.checkBox2.answer);
    formRunner.continueButton.click();
    formRunner.selectFromList(formData.selectList.answer);
    formRunner.inputField(formData.input2.question, formData.input2.answer);
    formRunner.inputDate(
      formData.date.day,
      formData.date.month,
      formData.date.year
    );
    formRunner.selectRadio(formData.radio2.answer, false);
    formRunner.textBox(formData.textBox1.question, formData.textBox1.answer);
    formRunner.inputField(
      formData.numberField.question,
      formData.numberField.answer
    );
    formRunner.inputField(formData.input3.question, formData.input3.answer);
    formRunner.inputField(
      formData.phoneNumber.question,
      formData.phoneNumber.answer
    );
    formRunner.continueButton.click();
    formRunner.inputField(
      formData.emailAddress.question,
      formData.emailAddress.answer
    );
    formRunner.inputField(
      formData.timeField.question,
      formData.timeField.answer
    );
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
