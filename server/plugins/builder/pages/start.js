const Page = require('.')

class StartPage extends Page {
  getViewModel (formData, errors) {
    console.log('XXX')
    return {
      ...super.getViewModel(formData, errors),
      isStartPage: true
    }
  }
}

module.exports = StartPage
