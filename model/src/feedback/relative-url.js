'use strict'

const feedbackReturnInfoParameter = 'f_t'

/**
  Enforces use of relative URL's, prevents someone maliciously causing a user to be directed to a phishing
  site from our feedback page.
**/
module.exports = class RelativeUrl {
  constructor (urlString) {
    this.url = new URL(urlString, 'http://www.example.com')
    if (this.url.hostname !== 'www.example.com') {
      throw Error('Only relative URLs are allowed in feedback configuration')
    }
  }

  addParam (name, value) {
    this.url.searchParams.set(name, value)
    return this
  }

  setFeedbackReturnInfo (value) {
    this.addParam(feedbackReturnInfoParameter, value)
    return this
  }

  getFeedbackReturnInfo () {
    return this.getParam(feedbackReturnInfoParameter)
  }

  getParam (name) {
    return this.url.searchParams.get(name)
  }

  toString () {
    return this.url.pathname + this.url.search
  }
}
