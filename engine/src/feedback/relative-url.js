/**
 * Enforces use of relative URL's, prevents someone maliciously causing a user to be directed to a phishing
 * site.
**/
export default class RelativeUrl {
  static FEEDBACK_RETURN_INFO_PARAMETER = 'f_t'
  static VISIT_IDENTIFIER_PARAMETER = 'visit'

  constructor (urlString) {
    this.url = new URL(urlString, 'http://www.example.com')
    this.originalUrlString = urlString
    if (this.url.hostname !== 'www.example.com' || urlString.includes('www.example.com')) {
      throw Error('Only relative URLs are allowed')
    }
  }

  setParam (name, value) {
    this.url.searchParams.set(name, value)
    return this
  }

  addParamIfNotPresent (name, value) {
    if (!this.url.searchParams.get(name)) {
      this.url.searchParams.set(name, value)
    }
    return this
  }

  set feedbackReturnInfo (value) {
    this.setParam(RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER, value)
  }

  get feedbackReturnInfo () {
    return this.getParam(RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER)
  }

  set visitIdentifier (value) {
    this.setParam(RelativeUrl.VISIT_IDENTIFIER_PARAMETER, value)
  }

  get visitIdentifier () {
    return this.getParam(RelativeUrl.VISIT_IDENTIFIER_PARAMETER)
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
