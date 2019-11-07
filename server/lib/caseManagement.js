const Wreck = require('@hapi/wreck')
const { caseManagementApiUrl } = require('./../config')

const options = {
  headers: {
    'content-type': 'application/json'
  }
}

const caseManagementPostRequest = async (answers) => {
  const data = { ...options, payload: JSON.stringify(answers) }
  try {
    const { payload } = await Wreck.post(`${caseManagementApiUrl}/v1/applications`, data)
    return JSON.parse(payload.toString())
  } catch (e) {
    throw e
  }
}

module.exports = {
  caseManagementPostRequest
}
