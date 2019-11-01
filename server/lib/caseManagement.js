const Wreck = require('@hapi/wreck')

const caseManagementApiUrl = ' '

const options = {
  headers: {
    'content-type': 'application/json'
  }
}

const caseManagementPostRequest = async (answers) => {
  const data = { ...options, payload: answers }
  try {
    const { payload } = await Wreck.post(`${caseManagementApiUrl}/payments`, data)
    return JSON.parse(payload.toString())
  } catch (e) {
    throw e
  }
}

module.exports = {
  caseManagementPostRequest
}
