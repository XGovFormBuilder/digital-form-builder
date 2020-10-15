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
