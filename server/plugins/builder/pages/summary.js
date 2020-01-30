const joi = require('joi')
const Page = require('.')
const shortid = require('shortid')
const { caseManagementPostRequest } = require('../../../lib/caseManagement')
const { caseManagementSchema } = require('./../../../lib/caseManagementSchema')
const { serviceName } = require('./../../../config')
const { flatten } = require('flat')

class SummaryViewModel {
  constructor (pageTitle, model, state) {
    this.pageTitle = pageTitle
    const details = []
    let relevantPages = []
      ;[undefined].concat(model.sections).forEach((section, index) => {
      const items = []
      const sectionState = section
        ? (state[section.name] || {})
        : state
      let isRelevantPage = true
      model.pages.forEach(page => {
        if (page.section === section) {
          page.components.formItems.forEach(component => {
            if (page.condition && model.conditions[page.condition]) {
              if (!model.conditions[page.condition].fn(state)) {
                isRelevantPage = false
                return
              }
            }
            if (isRelevantPage) {
              items.push({
                name: component.name,
                path: component.path,
                label: component.localisedString(component.title),
                value: component.getDisplayStringFromState(sectionState),
                url: `/${model.basePath}${page.path}?returnUrl=/${model.basePath}/summary`,
                pageId: `/${model.basePath}${page.path}`,
                type: component.type
              })
            }
          })
          if (isRelevantPage && page.components.formItems.length > 0) {
            relevantPages.push(page)
          }
        }
      })
      if (items.length > 0) {
        details.push({
          name: section && section.name ? section.name : null,
          title: section && section.title ? section.title : null,
          items
        })
      }
    })

    this.declaration = model.def.declaration

    let applicableFees = []

    if (model.def.fees) {
      applicableFees = model.def.fees.filter(fee => {
        return model.conditions[fee.condition].fn(state)
      })
    }

    const schema = model.makeFilteredSchema(state, relevantPages)
    const result = joi.validate(state, schema, { abortEarly: false, stripUnknown: true })

    if (result.error) {
      this.errors = result.error.details.map(err => {
        const name = err.path[err.path.length - 1]

        return {
          path: err.path.join('.'),
          name: name,
          message: err.message
        }
      })
      this.hasErrors = true

      details.forEach(detail => {
        const sectionErr = this.errors.find(err => err.path === detail.name)

        detail.items.forEach(item => {
          if (sectionErr) {
            item.inError = true
            return
          }

          const err = this.errors.find(err => err.path === (detail.name ? (detail.name + '.' + item.name) : item.name))
          if (err) {
            item.inError = true
          }
        })
      })
    }
    if (applicableFees.length) {
      this.fees = { details: applicableFees, total: Object.values(applicableFees).map(fee => fee.amount).reduce((a, b) => a + b) }
    }

    this.parseDataForCasebook(model, relevantPages, details)

    if (model.def.notify) {
      let flatState = flatten(state)
      let personalisation = { }
      model.def.notify.personalisation.forEach(p => {
        let condition = model.conditions[p]
        personalisation[p] = condition ? condition.fn(state) : flatState[p]
      })

      this.notifyOptions = { templateId: model.def.notify.templateId, personalisation, emailField: flatState[model.def.notify.emailField] }
    }

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  toEnglish (localisableString) {
    let englishString = ''
    if (localisableString) {
      if (typeof localisableString === 'string') {
        englishString = localisableString
      } else {
        englishString = localisableString.en
      }
    }
    return englishString
  }

  parseDataForCasebook (model, relevantPages, details) {
    let questions = relevantPages.map(page => {
      let category = page.section && page.section.name ? page.section.name : null
      let fields = []
      page.components.formItems.forEach(item => {
        let detail = details.find(d => d.name === category)
        fields.push({
          id: item.name,
          title: this.toEnglish(item.title),
          type: item.dataType,
          answer: detail.items.find(detailItem => detailItem.name === item.name).value
        })
      })

      let question = ''
      if (page.title) {
        question = this.toEnglish(page.title)
      } else {
        question = page.components.formItems.map(item => this.toEnglish(item.title)).join(', ')
      }

      return {
        id: `/${model.basePath}${page.path}`,
        category,
        question,
        fields
      }
    })

    // default name if no name is provided
    let englishName = `${serviceName} ${model.basePath}`
    if (model.name) {
      englishName = typeof model.name === 'string' ? model.name : model.name.en
    }

    this._caseManagementData = {
      metadata: model.def.metadata,
      id: model.basePath,
      name: englishName,
      questions: questions
    }
    if (this.fees) {
      this._caseManagementData.fees = this.fees
    }
  }
  get validatedCaseManagementData () {
    let result = caseManagementSchema.validate(this._caseManagementData, { abortEarly: false, stripUnknown: true })
    return result.value
  }

  set caseManagementDataPaymentReference (paymentReference) {
    this._caseManagementData.fees.paymentReference = paymentReference
  }

  get notifyOptions () {
    return this._notify
  }

  set notifyOptions (value) {
    this._notify = value
  }

  addDeclarationAsQuestion () {
    this._caseManagementData.questions.push({
      'id': '/summary',
      'category': null,
      'question': 'Declaration',
      'fields': [
        {
          'id': 'declaration',
          'title': 'Declaration',
          'type': 'boolean',
          'answer': true
        }
      ]
    })
  }
}

class SummaryPage extends Page {
  makeGetRouteHandler (getState) {
    return async (request, h) => {
      const { cacheService } = request.services([])
      this.langFromRequest(request)
      const model = this.model
      const state = await cacheService.getState(request)
      const viewModel = new SummaryViewModel(this.title, model, state)
      // redirect user to start page if there are incomplete form errors
      if (viewModel.result.error) {
        // default to first defined page
        let startPageRedirect = h.redirect(`/${model.basePath}${model.def.pages[0].path}`)
        let startPage = model.def.startPage
        if (startPage.startsWith('http')) {
          startPageRedirect = h.redirect(startPage)
        } else if (model.def.pages.find(page => page.path === startPage)) {
          startPageRedirect = h.redirect(`/${model.basePath}${startPage}`)
        }

        return startPageRedirect
      }
      let declarationError = request.yar.flash('declarationError')
      if (declarationError.length) {
        viewModel.declarationError = declarationError[0]
      }
      return h.view('summary', viewModel)
    }
  }

  streamToString (stream) {
    const chunks = []
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
  }

  makePostRouteHandler (getState) {
    return async (request, h) => {
      const { payService, cacheService } = request.services([])
      const lang = this.langFromRequest(request)
      const model = this.model
      const state = await cacheService.getState(request)
      const summaryViewModel = new SummaryViewModel(this.title, model, state)
      if (summaryViewModel.declaration) {
        let reqString = await this.streamToString(request.payload)
        let data = new URLSearchParams(reqString)
        if (!data.get('declaration')) {
          request.yar.flash('declarationError', 'You must declare to be able to submit this application')
          return h.redirect(`${request.headers.referer}#declaration`)
        } else {
          summaryViewModel.addDeclarationAsQuestion()
        }
      }
      await cacheService.mergeState(request, { notify: summaryViewModel.notifyOptions })

      if (!summaryViewModel.fees) {
        const { reference } = await caseManagementPostRequest(summaryViewModel._caseManagementData)
        await cacheService.mergeState(request, { reference })
        return h.redirect(`/status`)
      } else {
        const paymentReference = `FCO-${shortid.generate()}`
        const description = model.def.name ? this.localisedString(model.def.name, lang) : `${serviceName} ${this.model.basePath}`
        const res = await payService.payRequest(summaryViewModel.fees.total, paymentReference, description)

        request.yar.set('basePath', model.basePath)
        await cacheService.mergeState(request, { pay: { payId: res.payment_id, reference: paymentReference, self: res._links.self.href, meta: { amount: summaryViewModel.fees.total, description, attempts: 1 } } })
        summaryViewModel.caseManagementDataPaymentReference = paymentReference
        await cacheService.mergeState(request, { caseManagementData: summaryViewModel.validatedCaseManagementData })

        return h.redirect(res._links.next_url.href)
      }
    }
  }
  get postRouteOptions () {
    return {
      ext: {
        onPreHandler: {
          method: async (request, h) => {
            return h.continue
          }
        }
      }
    }
  }
}

module.exports = SummaryPage
