const Page = require("../pages/page");

class MenuSection extends Page {
  get menuContainer() {
    return $("div.menu");
  }

  buttonByName(name) {
    return this.menuContainer.$(`button=${name}`);
  }
}

module.exports = new MenuSection();
