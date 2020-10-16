import Page from './index'

export default class StartPage extends Page {
  getViewModel (formData, errors) {
    return {
      ...super.getViewModel(formData, errors),
      isStartPage: true,
      skipTimeoutWarning: true
    }
  }
}

// Keep module.exports until https://github.com/XGovFormBuilder/digital-form-builder/issues/162
module.exports = StartPage
