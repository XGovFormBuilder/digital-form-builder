const { expect } = require('code')

class HtmlHelper {
  constructor ($) {
    this.$ = $
  }

  assertTitle (value) {
    expect(this.$('title').text()).to.equal(value)
  }

  assertError (value) {
    expect(this.$('title').text()).to.equal(value)
  }
}

module.exports = HtmlHelper
