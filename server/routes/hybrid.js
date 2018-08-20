const data = require('../govsite')
const section = data.sections.find(s => s.name === 'checkBeforeStart')
const { GetPageViewModel } = require('digital-form-builder-engine/models')
const { getPageState } = require('../db')

const page = {
  path: '/hybrid',
  components: [
    {
      type: 'TextField',
      name: 'fullName',
      title: 'Company name',
      schema: {
        max: 40
      }
    }
  ],
  next: [
    {
      path: '/full-name'
    }
  ]
}

module.exports = {
  method: 'GET',
  path: page.path,
  options: {
    handler: async (request, h) => {
      const defns = { data, section, page }
      const pageState = await getPageState()

      const pageViewModel = new GetPageViewModel(defns, pageState)

      return h.view('index', pageViewModel)
    }
  }
}
