const { payApiKey, payApiUrl, payReturnUrl } = require('../config')
const { caseManagementPostRequest } = require('./../lib/caseManagement')
const Wreck = require('@hapi/wreck')
const Cache = require('./../db')

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
    'return_url': payReturnUrl
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

const pay = {
  plugin: {
    name: 'pay',
    dependencies: 'vision',
    multiple: true,
    register: (server) => {
      server.route({
        method: 'get',
        path: '/status',
        handler: async (request, h) => {
          const { notifyService } = request.services([])
          let { personalisations } = await Cache.getState(request)
          notifyService.sendNotification('8c1eb93f-c7db-42f8-a90c-3ae1cfba13be', 'jen@cautionyourblast.com', '123', personalisations || {})
          const { pay } = await Cache.getState(request)
          const basePath = request.yar.get('basePath')
          if (pay) {
            const { self, reference } = pay
            const { state } = await payStatus(self)
            if (state.finished) {
              switch (state.status) {
                case 'success':
                  let { caseManagementData } = await Cache.getState(request)
                  let response = await caseManagementPostRequest(caseManagementData)
                  await Cache.clearState(request)
                  if (response.reference === 'UNKNOWN') {
                    return h.view('confirmation', { })
                  }
                  return h.view('confirmation', { reference: response.reference })
                case 'failed':
                case 'error':
                  return h.view('application-error', { reference, errorList: ['there was a problem with your payment'] })
              }
            } else {
              // TODO:- unfinished payment flow?
            }
          } else {
            return h.redirect(`${basePath}`)
          }
        }
      })
    }
  }
}

module.exports = {
  payRequest, payStatus, pay
}
