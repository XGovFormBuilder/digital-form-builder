const Page = require('.')
const { payStatus } = require('../../pay')

class ConfirmationPage extends Page {
  makeGetRouteHandler (getState) {
    return async (request, h) => {
      const model = this.model
      console.log(payStatus())
      // const { self } = request.yar.get('pay')
      // try {
      //   let res = await payStatus(self)
      //   console.log(res)
      // } catch (ex) {
      //   // error with payRequest
      //   console.log(ex)
      // }

      return h.view('confirmation', model)
    }
  }
}
module.exports = ConfirmationPage
