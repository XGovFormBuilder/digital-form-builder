const Wreck = require('@hapi/wreck')
const { caseManagementApiUrl } = require('./../config')

const options = {
  headers: {
    'content-type': 'application/json'
  },
  timeout: 60000
}

/**
 * @deprecated use WebhookService.postRequest instead.
 */
const caseManagementPostRequest = async (answers) => {
  const data = { ...options, payload: JSON.stringify(answers) }
  try {
    const { payload, res } = await Wreck.post(`${caseManagementApiUrl}/v1/applications`, data)
    if (payload && payload.toString()) {
      return JSON.parse(payload.toString())
    }
    if (res.statusCode === 202) {
      // send dead letter queue message
    }
    return { reference: 'UNKNOWN' }
  } catch (e) {
    throw e
  }
}

module.exports = {
  caseManagementPostRequest
}
