const Page = require("../page");

class MenuSection extends Page {
  buttonByName(name) {
    return this.designerMenu.$(`button=${name}`);
  }
}

module.exports = new MenuSection();