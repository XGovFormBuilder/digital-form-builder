const { caseManagementPostRequest } = require('./../lib/caseManagement')
const Cache = require('./../db')
const shortid = require('shortid')


const applicationStatus = {
  plugin: {
    name: 'applicationStatus',
    dependencies: 'vision',
    multiple: true,
    register: (server) => {
      server.route({
        method: 'get',
        path: '/status',
        handler: async (request, h) => {
          const { notifyService, payService } = request.services([])
          const { pay } = await Cache.getState(request)
          const params = request.query
          const basePath = request.yar.get('basePath')
          //TODO:- if statement hell.. sorry!
          if (pay) {
            const { self, reference, meta } = pay
            const { state } = await payService.payStatus(self)
            const userCouldntPay = params.continue || meta.attempts === 3

            if (state.finished || userCouldntPay) {
              if (state.status === 'success' || userCouldntPay) {
                let { notify, caseManagementData } = await Cache.getState(request)
                if (userCouldntPay) {
                  delete caseManagementData.fees
                }
                let response = await caseManagementPostRequest(caseManagementData)
                let reference = response.reference !== 'UNKNOWN' ? response.reference : ''
                if (notify) {
                  let {templateId, personalisation, emailField} = notify
                  notifyService.sendNotification(templateId, emailField, reference, personalisation || {})
                }
                await Cache.clearState(request)
                return h.view('confirmation', {reference, paySkipped: userCouldntPay})
              } else {
                  return h.view('pay-error', { reference, errorList: ['there was a problem with your payment'] })
              }
            } else {
              // TODO:- unfinished payment flow?
            }
          } else {
            return h.redirect(`${basePath}`)
          }
        }
      })
      server.route({
        method: 'post',
        path: '/status',
        handler: async (request, h) => {
          const { payService } = request.services([])
          let { pay } = await Cache.getState(request)
          let { meta } = pay
          meta.attempts++
          //TODO:- let payService handle shortid.generate()
          let reference = `FCO-${shortid.generate()}`
          const res = await payService.payRequest(pay.meta.amount, reference, pay.meta.description)
          await Cache.mergeState(request, { pay: { payId: res.payment_id, reference, self: res._links.self.href, meta } })
          return h.redirect(res._links.next_url.href)
        }
      })

    }
  }
}

module.exports = applicationStatus
