'use strict'

const atob = require('atob')
const btoa = require('btoa')
const RelativeUrl = require('./relative-url')

class FeedbackContextInfo {
  static CONTEXT_ITEMS = [
    { key: 'feedbackContextInfo_formTitle', display: 'Feedback source form name', get: contextInfo => contextInfo.formTitle },
    { key: 'feedbackContextInfo_pageTitle', display: 'Feedback source page title', get: contextInfo => contextInfo.pageTitle },
    { key: 'feedbackContextInfo_url', display: 'Feedback source url', get: contextInfo => contextInfo.url }
  ]

  constructor (formTitle, pageTitle, url) {
    this.formTitle = formTitle
    this.pageTitle = pageTitle
    // parse as a relative Url to ensure they're sensible values and prevent phishing
    this.url = url ? new RelativeUrl(url).toString() : url
  }

  toString () {
    return btoa(JSON.stringify(this))
  }
}
module.exports.FeedbackContextInfo = FeedbackContextInfo

module.exports.decode = function decode (encoded) {
  if (encoded) {
    const decoded = JSON.parse(atob(encoded))
    return new FeedbackContextInfo(decoded.formTitle, decoded.pageTitle, decoded.url)
  }
  return undefined
}
