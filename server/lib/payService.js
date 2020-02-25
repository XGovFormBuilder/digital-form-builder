const { payApiUrl, payReturnUrl } = require('../config')
const Wreck = require('@hapi/wreck')

class PayService {
  options (apiKey) {
    return {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json'
      }
    }
  }

  payRequestData (amount, reference, description) {
    return {
      amount,
      reference,
      description,
      'return_url': payReturnUrl
    }
  }

  async payRequest (amount, reference, description, apiKey) {
    const data = { ...this.options(apiKey), payload: this.payRequestData(amount, reference, description) }
    try {
      const { payload } = await Wreck.post(`${payApiUrl}/payments`, data)
      return JSON.parse(payload.toString())
    } catch (e) {
      throw e
    }
  }

  async payStatus (url, apiKey) {
    try {
      const { payload } = await Wreck.get(url, this.options(apiKey))
      return JSON.parse(payload.toString())
    } catch (e) {
      throw e
    }
  }

  descriptionFromFees (fees) {
    return fees.details.map(detail => `${detail.description}: £${detail.amount / 100}`).join(', ')
  }
}

module.exports = {
  PayService
}
