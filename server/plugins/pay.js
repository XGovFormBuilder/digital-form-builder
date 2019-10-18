const { payApiKey, payApiUrl } = require('../config')
const Wreck = require('@hapi/wreck')

const options = {
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
    'return_url': `https://fco-forms.herokuapp.com/confirmation`
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

const payStatus = async (url) => {
  try {
    const { payload } = await Wreck.get(url, options)
    return JSON.parse(payload.toString())
  } catch (e) {
    throw e
  }
}

module.exports = {
  payRequest, payStatus
}
