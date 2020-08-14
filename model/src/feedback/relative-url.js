'use strict'

/**
  Enforces use of relative URL's, prevents someone maliciously causing a user to be directed to a phishing
  site.
**/
module.exports = class RelativeUrl {
  static FEEDBACK_RETURN_INFO_PARAMETER = 'f_t'

  constructor (urlString) {
    this.url = new URL(urlString, 'http://www.example.com')
    this.originalUrlString = urlString
    if (this.url.hostname !== 'www.example.com' || urlString.includes('www.example.com')) {
      throw Error('Only relative URLs are allowed')
    }
  }

  addParam (name, value) {
    this.url.searchParams.set(name, value)
    return this
  }

  addParamIfNotPresent (name, value) {
    if (!this.url.searchParams.get(name)) {
      this.url.searchParams.set(name, value)
    }
    return this
  }

  setFeedbackReturnInfo (value) {
    this.addParam(RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER, value)
    return this
  }

  getFeedbackReturnInfo () {
    return this.getParam(RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER)
  }

  getParam (name) {
    return this.url.searchParams.get(name)
  }

  toString () {
    let url = this.url.pathname + this.url.search
    if (url.startsWith('/') && !this.originalUrlString.startsWith('/')) {
      url = url.substr(1)
    }
    return url
  }
}
