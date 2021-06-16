class FormPage {
  constructor(selector) {
    this.parent = $(selector);
  }

  get section() {
    return this.parent.$(".page__heading span");
  }

  get heading() {
    return this.parent.$("h3");
  }

  get editPage() {
    return this.parent.$("button=Edit page");
  }

  get createComponent() {
    return this.parent.$("button=Create component");
  }

  get previewPage() {
    return this.parent.$("a");
  }

  get dateField() {
    return this.parent.react$("DateField");
  }

  get datePartsField() {
    return this.parent.react$("DatePartsField");
  }

  get dateTimeField() {
    return this.parent.react$("DateTimeField");
  }

  get emailAddressField() {
    return this.parent.react$("EmailAddressField");
  }

  get flashCard() {
    return this.parent.react$("FlashCard");
  }

  get paragraph() {
    return this.parent.react$("Para");
  }

  get textField() {
    return this.parent.react$("TextField");
  }
}

module.exports = FormPage;
