const Page = require("../pages/basePage");

class MenuSection extends Page {
  get menuContainer() {
    return browser.$("nav.menu");
  }

  buttonByName(name) {
    return this.menuContainer.$(`button=${name}`);
  }
}

module.exports = new MenuSection();
