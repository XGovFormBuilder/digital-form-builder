const Wreck = require('@hapi/wreck')
const options = {
  headers: {
    'content-type': 'application/json'
  },
  timeout: 60000
}

class WebhookService {
  /**
   * Posts data to a webhook
   * @params { string } url must be webhook with a POST endpoint which returns a webhookResponse object.
   * @returns { object } webhookResponse
   * @returns { string } webhookResponse.reference webhook should return with a reference number. If the call fails, the reference will be 'UNKNOWN'.
   */
  async postRequest (url, data) {
    const { payload, res } = await Wreck.post(url, { ...options, payload: JSON.stringify(data) })
    if (payload && payload.toString()) {
      return JSON.parse(payload.toString())
    }
    if (res.statusCode === 202) {
      // send dead letter queue message
    }
    return { reference: 'UNKNOWN' }
  }
}

module.exports = {
  WebhookService
}
