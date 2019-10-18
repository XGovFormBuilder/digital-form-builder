const { payApiKey, payApiUrl, serviceUrl } = require('../config')
const Wreck = require('@hapi/wreck')

const options = {
  baseUrl: payApiUrl,
  headers: {
    Authorization: `Bearer ${payApiKey}`,
    'content-type': 'application/json'
  }
}

const payRequestData = (amount, reference, description) => {
  return {
    amount,
    reference,
    description,
    'return_url': `https://fco-forms.herokuapp.com/france`,
    parse: true
  }
}

const payRequest = async (amount, reference, description) => {
  const data = { ...options, payload: payRequestData(amount, reference, description) }
  try {
    const { payload } = await Wreck.post(`${payApiUrl}/payments`, data)
    return JSON.parse(payload.toString())
  } catch (e) {
    throw e
  }
}

module.exports = {
  payRequest
}
