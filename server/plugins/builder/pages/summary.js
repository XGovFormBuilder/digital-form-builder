const joi = require('joi')
const Page = require('.')
const shortid = require('shortid')
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
                rawValue: sectionState[component.name],
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
    this.skipSummary = model.def.skipSummary

    let applicableFees = []

    if (model.def.fees) {
      applicableFees = model.def.fees.filter(fee => {
        return !fee.condition || model.conditions[fee.condition].fn(state)
      })

      this._payApiKey = model.def.payApiKey
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

    this.parseDataForWebhook(model, relevantPages, details)

    if (model.def.outputs) {
      this._outputs = model.def.outputs.map(output => {
        switch (output.type) {
          case 'notify':
            return { type: 'notify', outputData: this.notifyModel(model, output.outputConfiguration, state) }
          case 'email':
            return { type: 'email', outputData: this.emailModel(model, output.outputConfiguration) }
          case 'webhook':
            return { type: 'webhook', outputData: { url: output.outputConfiguration.url } }
        }
      })
    }

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  notifyModel (model, outputConfiguration, state) {
    let flatState = flatten(state)
    let personalisation = { }
    outputConfiguration.personalisation.forEach(p => {
      let condition = model.conditions[p]
      personalisation[p] = condition ? condition.fn(state) : flatState[p]
    })
    return { templateId: outputConfiguration.templateId, personalisation, emailField: flatState[outputConfiguration.emailField], apiKey: outputConfiguration.apiKey }
  }

  emailModel (outputOptions) {
    let attachments = []
    this._webhookData.questions.forEach(question => {
      question.fields.forEach(field => {
        if (field.type === 'file' && field.answer) {
          attachments.push({ question: question.question, answer: field.answer })
        }
      })
    })
    let data = `'question','field','answer'` + '\n' + this._webhookData.questions.map(question => {
      return question.fields.map(field => `${question.question}, ${field.title}, ${field.answer}`).join('\r\n')
    })

    return { data, emailAddress: outputOptions.emailAddress, attachments }
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

  parseDataForWebhook (model, relevantPages, details) {
    let questions = relevantPages.map(page => {
      let category = page.section && page.section.name ? page.section.name : null
      let fields = []
      page.components.formItems.forEach(item => {
        let detail = details.find(d => d.name === category)
        fields.push({
          id: item.name,
          title: this.toEnglish(item.title),
          type: item.dataType,
          answer: detail.items.find(detailItem => detailItem.name === item.name).rawValue
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

    this._webhookData = {
      metadata: model.def.metadata,
      id: model.basePath,
      name: englishName,
      questions: questions
    }
    if (this.fees) {
      this._webhookData.fees = this.fees
    }
  }
  get validatedWebhookData () {
    let result = caseManagementSchema.validate(this._webhookData, { abortEarly: false, stripUnknown: true })
    return result.value
  }

  set webhookDataPaymentReference (paymentReference) {
    this._webhookData.fees.paymentReference = paymentReference
  }

  get outputs () {
    return this._outputs
  }

  set outputs (value) {
    this._outputs = value
  }

  get payApiKey () {
    return this._payApiKey
  }

  addDeclarationAsQuestion () {
    this._webhookData.questions.push({
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
  makeGetRouteHandler () {
    return async (request, h) => {
      this.langFromRequest(request)
      const { cacheService } = request.services([])
      const model = this.model
      if (this.model.def.skipSummary) {
        return this.makePostRouteHandler()(request, h)
      }
      const state = await cacheService.getState(request)

      const viewModel = new SummaryViewModel(this.title, model, state)
      viewModel.currentPath = `/${model.basePath}${this.path}`

      let declarationError = request.yar.flash('declarationError')
      if (declarationError.length) {
        viewModel.declarationError = declarationError[0]
      }
      return h.view('summary', viewModel)
    }
  }

  makePostRouteHandler () {
    return async (request, h) => {
      const { payService, cacheService } = request.services([])
      const model = this.model
      const state = await cacheService.getState(request)
      const summaryViewModel = new SummaryViewModel(this.title, model, state)
      // redirect user to start page if there are incomplete form errors
      if (summaryViewModel.result.error) {
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

      if (summaryViewModel.declaration && !summaryViewModel.skipSummary) {
        const { declaration } = request.payload
        if (!declaration) {
          request.yar.flash('declarationError', 'You must declare to be able to submit this application')
          return h.redirect(`${request.headers.referer}#declaration`)
        }
        summaryViewModel.addDeclarationAsQuestion()
      }

      await cacheService.mergeState(request, { outputs: summaryViewModel.outputs })
      await cacheService.mergeState(request, { webhookData: summaryViewModel.validatedWebhookData })

      if (!summaryViewModel.fees) {
        return h.redirect(`/status`)
      }

      const paymentReference = `FCO-${shortid.generate()}`
      const description = payService.descriptionFromFees(summaryViewModel.fees)
      const res = await payService.payRequest(summaryViewModel.fees.total, paymentReference, description, summaryViewModel.payApiKey)

      request.yar.set('basePath', model.basePath)
      await cacheService.mergeState(request, { pay:
          { payId: res.payment_id,
            reference: paymentReference,
            self: res._links.self.href,
            meta: { amount: summaryViewModel.fees.total, description, attempts: 1, payApiKey: summaryViewModel.payApiKey }
          } })
      summaryViewModel.webhookDataPaymentReference = paymentReference
      await cacheService.mergeState(request, { webhookData: summaryViewModel.validatedWebhookData })

      return h.redirect(res._links.next_url.href)
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
