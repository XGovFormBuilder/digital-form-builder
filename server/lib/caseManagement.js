const Wreck = require('@hapi/wreck')
const { caseManagementApiUrl } = require('./../config')

const options = {
  headers: {
    'content-type': 'application/json'
  },
  timeout: 60000
}

const caseManagementPostRequest = async (answers) => {
  const data = { ...options, payload: JSON.stringify(answers) }
  try {
    const { payload } = await Wreck.post(`${caseManagementApiUrl}/v1/applications`, data)
    if (payload && payload.toString()) {
      return JSON.parse(payload.toString())
    }
    return { reference: 'unknown' }
  } catch (e) {
    throw e
  }
}

module.exports = {
  caseManagementPostRequest
}
