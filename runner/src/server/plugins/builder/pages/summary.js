const { Helpers } = require('digital-form-builder-engine')

const redirectTo = Helpers.redirectTo
const redirectUrl = Helpers.redirectUrl

const joi = require('joi')
const Page = require('./index')
const shortid = require('shortid')
const { formSchema } = require('../../../lib/formSchema')
const { serviceName } = require('../../../config') //eslint-disable-line
const { flatten } = require('flat') //eslint-disable-line
const { clone, reach } = require('hoek') //eslint-disable-line
const { decode, RelativeUrl, FeedbackContextInfo } = require('digital-form-builder-model') //eslint-disable-line

/**
 * TODO - extract submission behaviour dependencies from the viewmodel
 * Webhookdata
 * outputs
 * skipSummary (replace with reference to this.model.def.skipSummary?)
 * _payApiKey
 * replace result with errors?
 * remove state and value?
 *
 * TODO - Pull out summary behaviours into separate service classes?
 * TODO - Move outputs conversion to an outputs service?
 * TODO - Move outputs / pay integration etc etc into a submission service rather than applicationStatus.js
 */
class SummaryViewModel {
  constructor (pageTitle, model, state, request) {
    this.pageTitle = pageTitle

    const { relevantPages, endPage } = this.#getRelevantPages(model, state)
    const details = this.#summaryDetails(request, model, state, relevantPages)

    this.declaration = model.def.declaration
    this.skipSummary = model.def.skipSummary
    this.endPage = endPage
    const schema = model.makeFilteredSchema(state, relevantPages)

    const collatedRepeatPagesState = clone(state)
    delete collatedRepeatPagesState.progress
    Object.entries(collatedRepeatPagesState).forEach(([key, section]) => {
      if (Array.isArray(section)) {
        collatedRepeatPagesState[key] = section.map(pages => Object.values(pages).reduce((acc, p) => ({ ...acc, ...p }), {}))
      }
    })

    const result = joi.validate(collatedRepeatPagesState, schema, { abortEarly: false, stripUnknown: true })

    if (result.error) {
      this.#processErrors(result, details)
    } else {
      this.fees = this.#retrieveFees(model, state)
      this.#parseDataForWebhook(model, relevantPages, details)
      this._webhookData = this.#addFeedbackSourceDataToWebhook(this._webhookData, model, request)

      if (model.def.outputs) {
        this._outputs = model.def.outputs.map(output => {
          switch (output.type) {
            case 'notify':
              return { type: 'notify', outputData: this.#notifyModel(model, output.outputConfiguration, state) }
            case 'email':
              return { type: 'email', outputData: this.#emailModel(model, output.outputConfiguration) }
            case 'webhook':
              return { type: 'webhook', outputData: { url: output.outputConfiguration.url } }
            case 'sheets':
              return { type: 'sheets', outputData: this.#sheetsModel(model, output.outputConfiguration, state) }
          }
        })
      }
    }

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  #retrieveFees(model, state) { //eslint-disable-line
    let applicableFees = []

    if (model.def.fees) {
      applicableFees = model.def.fees.filter(fee => {
        return !fee.condition || model.conditions[fee.condition].fn(state)
      })

      this._payApiKey = model.def.payApiKey
      const flatState = flatten(state)
      return {
        details: applicableFees,
        total: Object.values(applicableFees).map(fee => {
          if (fee.multiplier) {
            const multiplyBy = flatState[fee.multiplier]
            fee.multiplyBy = Number(multiplyBy)
            return fee.multiplyBy * fee.amount
          }
          return fee.amount
        }).reduce((a, b) => a + b, 0)
      }
    }
  }

  #processErrors(result, details) { //eslint-disable-line
    this.errors = result.error.details.map(err => {
      const name = err.path[err.path.length - 1]

      return {
        path: err.path.join('.'),
        name: name,
        message: err.message
      }
    })

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

  #summaryDetails(request, model, state, relevantPages) { //eslint-disable-line
    const details = [];

    [undefined, ...model.sections].forEach(section => {
      const items = []
      let sectionState = section
          ? (state[section.name] || {})
          : state

      const sectionPages = relevantPages
          .filter(page => page.section === section)

      const repeatablePage = sectionPages.find(page => !!page.repeatField)
      // Currently can't handle repeatable page outside a section.
      // In fact currently if any page in a section is repeatable it's expected that all pages in that section will be
      // repeatable
      if (section && repeatablePage) {
        if (!state[section.name]) {
          state[section.name] = sectionState = []
        }
        // Make sure the right number of items
        const requiredIterations = reach(state, repeatablePage.repeatField)
        if (requiredIterations < sectionState.length) {
          state[section.name] = sectionState.slice(0, requiredIterations)
        } else {
          for (let i = sectionState.length; i < requiredIterations; i++) {
            sectionState.push({})
          }
        }
      }

      sectionPages
          .forEach(page => {
            for (const component of page.components.formItems) {
              const item = this.Item(request, component, sectionState, page, model)
              items.push(item)
              if (component.items) {
                const selectedValue = sectionState[component.name]
                const selectedItem = component.items.filter(i => i.value === selectedValue)[0]
                if (selectedItem && selectedItem.conditional) {
                  for (const cc of selectedItem.conditional.componentCollection.formItems) {
                    const cItem = this.Item(request, cc, sectionState, page, model)
                    items.push(cItem)
                  }
                }
              }
            }
          })

      if (items.length > 0) {
        if (Array.isArray(sectionState)) {
          details.push({
            name: section?.name,
            title: section?.title,
            items: [...Array(reach(state, repeatablePage.repeatField))].map((x, i) => {
              return items.map(item => item[i])
            })
          })
        } else {
          details.push({
            name: section?.name,
            title: section?.title,
            items
          })
        }
      }
    })
    return details;
  }

  #getRelevantPages(model, state) { //eslint-disable-line
    let nextPage = model.startPage
    const relevantPages = []
    let endPage = null

    while (nextPage != null) {
      if (nextPage.hasFormComponents) {
        relevantPages.push(nextPage)
      } else if (!nextPage.hasNext && !(nextPage instanceof SummaryPage)) {
        endPage = nextPage
      }
      nextPage = nextPage.getNextPage(state, true)
    }
    return {relevantPages, endPage};
  }

  #notifyModel (model, outputConfiguration, state) { //eslint-disable-line
    const flatState = flatten(state)
    const personalisation = {}
    outputConfiguration.personalisation.forEach(p => {
      const condition = model.conditions[p]
      personalisation[p] = condition ? condition.fn(state) : flatState[p]
    })
    return {
      templateId: outputConfiguration.templateId,
      personalisation,
      emailField: flatState[outputConfiguration.emailField],
      apiKey: outputConfiguration.apiKey
    }
  }

  #emailModel (outputOptions) { //eslint-disable-line
    const attachments = []
    this._webhookData.questions.forEach(question => {
      question.fields.forEach(field => {
        if (field.type === 'file' && field.answer) {
          attachments.push({ question: question.question, answer: field.answer })
        }
      })
    })
    const data = '\'question\',\'field\',\'answer\'' + '\n' + this._webhookData.questions.map(question => {
      return question.fields.map(field => `${question.question}, ${field.title}, ${field.answer}`).join('\r\n')
    })

    return { data, emailAddress: outputOptions.emailAddress, attachments }
  }

  #sheetsModel (model, outputConfiguration, state) { //eslint-disable-line
    const flatState = flatten(state)
    // eslint-disable-next-line camelcase
    const { credentials, project_id, scopes } = outputConfiguration
    const spreadsheetName = flatState[outputConfiguration.spreadsheetIdField]
    const spreadsheetId = outputConfiguration.sheets.find(sheet => sheet.name === spreadsheetName).id
    return {
      data: [].concat.apply([], this._webhookData.questions.map(question => question.fields.map(field => field.answer))),
      authOptions: { credentials, project_id, scopes },
      spreadsheetId
    }
  }

  #toEnglish (localisableString) { //eslint-disable-line
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

  #parseDataForWebhook (model, relevantPages, details) { //eslint-disable-line
    const questions = []

    for (const page of relevantPages) {
      const category = page.section?.name
      const isRepeatable = !!page.repeatField
      const detail = details.find(d => d.name === category)

      let question
      if (page.title) {
        question = this.#toEnglish(page.title)
      } else {
        question = page.components.formItems.map(item => this.#toEnglish(item.title)).join(', ')
      }

      let items
      if (isRepeatable) {
        items = detail.items
      } else {
        items = [detail.items]
      }

      for (let index = 0; index < items.length; index++) {
        const item = items[index].filter(detailItem => detailItem.pageId === `/${model.basePath}${page.path}`)
        const fields = []

        for (const detailItem of item) {
          const answer = (typeof detailItem.rawValue === 'object') ? detailItem.value : detailItem.rawValue
          fields.push({
            key: detailItem.name,
            title: this.#toEnglish(detailItem.title),
            type: detailItem.dataType,
            answer
          })

          if (detailItem.items) {
            const selectedItem = detailItem.items.filter(i => i.value === answer)[0]
            if (selectedItem && selectedItem.conditional) {
              selectedItem.conditional.componentCollection.formItems.forEach(cc => {
                const itemDetailItem = detail.items.find(detailItem => detailItem.name === cc.name)
                fields.push({
                  key: cc.name,
                  title: this.#toEnglish(cc.title),
                  type: cc.dataType,
                  answer: (typeof itemDetailItem.rawValue === 'object') ? itemDetailItem.value : itemDetailItem.rawValue
                })
              })
            }
          }
        }

        questions.push({
          category,
          question,
          fields,
          index
        })
      }
    }

    // default name if no name is provided
    let englishName = `${serviceName} ${model.basePath}`
    if (model.name) {
      englishName = typeof model.name === 'string' ? model.name : model.name.en
    }

    this._webhookData = {
      metadata: model.def.metadata,
      name: englishName,
      questions: questions
    }
    if (this.fees) {
      this._webhookData.fees = this.fees
    }
  }

  get validatedWebhookData () {
    const result = formSchema.validate(this._webhookData, { abortEarly: false, stripUnknown: true })
    return result.value
  }

  get webhookDataPaymentReference () {
    return this._webhookData.fees.paymentReference ?? ''
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
      category: null,
      question: 'Declaration',
      fields: [
        {
          key: 'declaration',
          title: 'Declaration',
          type: 'boolean',
          answer: true
        }
      ]
    })
  }

  Item (request, component, sectionState, page, model, params = { returnUrl: `/${model.basePath}/summary` }) {
    const isRepeatable = !!page.repeatField

    if (isRepeatable && Array.isArray(sectionState)) {
      return sectionState.map((state, i) => {
        const collated = Object.values(state).reduce((acc, p) => ({ ...acc, ...p }), {})
        return this.Item(request, component, collated, page, model, { ...params, num: i + 1 })
      })
    }

    return {
      name: component.name,
      path: component.path,
      label: component.localisedString(component.title),
      value: component.getDisplayStringFromState(sectionState),
      rawValue: sectionState[component.name],
      url: redirectUrl(request, `/${model.basePath}${page.path}`, params),
      pageId: `/${model.basePath}${page.path}`,
      type: component.type,
      title: component.title,
      dataType: component.dataType
    }
  }

  #addFeedbackSourceDataToWebhook(webhookData, model, request) { //eslint-disable-line
    if(model.def.feedback?.feedbackForm) {
      const feedbackContextInfo = decode(new RelativeUrl(`${request.url.pathname}${request.url.search}`).getFeedbackReturnInfo())
      if(feedbackContextInfo) {
        webhookData.questions.push(
          ...FeedbackContextInfo.CONTEXT_ITEMS.map(item => ({
                category: null,
                question: item.display,
                fields: [
                  {
                    key: item.key,
                    title: item.display,
                    type: 'string',
                    answer: item.get(feedbackContextInfo)
                  }
                ]
              })
          )
        )
      }
    }
    return webhookData;
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
      const viewModel = new SummaryViewModel(this.title, model, state, request)
      viewModel.currentPath = `/${model.basePath}${this.path}`

      if (viewModel.endPage) {
        return redirectTo(request, h, `/${model.basePath}${viewModel.endPage.path}`)
      }

      if (viewModel.errors) {
        const errorToFix = viewModel.errors[0]
        const { path } = errorToFix
        const parts = path.split('.')
        const section = parts[0]
        const property = parts.length > 1 ? parts[parts.length - 1] : null
        const iteration = parts.length === 3 ? Number(parts[1]) + 1 : null
        const pageWithError = model.pages.filter(page => {
          if (page.section && page.section.name === section) {
            let propertyMatches = true
            let conditionMatches = true
            if (property) {
              propertyMatches = page.components.formItems.filter(item => item.name === property).length > 0
            }
            if (propertyMatches && page.condition && model.conditions[page.condition]) {
              conditionMatches = model.conditions[page.condition].fn(state)
            }
            return propertyMatches && conditionMatches
          }
          return false
        })[0]
        if (pageWithError) {
          const params = {
            returnUrl: `/${model.basePath}/summary`,
            num: iteration && pageWithError.repeatField ? iteration : null
          }
          return redirectTo(request, h, `/${model.basePath}${pageWithError.path}`, params)
        }
      }

      const declarationError = request.yar.flash('declarationError')
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
      const summaryViewModel = new SummaryViewModel(this.title, model, state, request)
      // redirect user to start page if there are incomplete form errors
      if (summaryViewModel.result.error) {
        // default to first defined page
        let startPageRedirect = redirectTo(request, h, `/${model.basePath}${model.def.pages[0].path}`)
        const startPage = model.def.startPage
        if (startPage.startsWith('http')) {
          startPageRedirect = redirectTo(request, h, startPage)
        } else if (model.def.pages.find(page => page.path === startPage)) {
          startPageRedirect = redirectTo(request, h, `/${model.basePath}${startPage}`)
        }

        return startPageRedirect
      }

      if (summaryViewModel.declaration && !summaryViewModel.skipSummary) {
        const { declaration } = request.payload
        if (!declaration) {
          request.yar.flash('declarationError', 'You must declare to be able to submit this application')
          return redirectTo(request, h, `${request.headers.referer}#declaration`)
        }
        summaryViewModel.addDeclarationAsQuestion()
      }

      await cacheService.mergeState(request, { outputs: summaryViewModel.outputs })
      await cacheService.mergeState(request, { webhookData: summaryViewModel.validatedWebhookData })

      if (!summaryViewModel.fees || (summaryViewModel.fees.details ?? []).length === 0) {
        return redirectTo(request, h, '/status')
      }

      const paymentReference = `FCO-${shortid.generate()}`
      const description = payService.descriptionFromFees(summaryViewModel.fees)
      const res = await payService.payRequest(summaryViewModel.fees.total, paymentReference, description, summaryViewModel.payApiKey)

      request.yar.set('basePath', model.basePath)
      await cacheService.mergeState(request, {
        pay:
          {
            payId: res.payment_id,
            reference: paymentReference,
            self: res._links.self.href,
            meta: { amount: summaryViewModel.fees.total, description, attempts: 1, payApiKey: summaryViewModel.payApiKey }
          }
      })
      summaryViewModel.webhookDataPaymentReference = paymentReference
      await cacheService.mergeState(request, { webhookData: summaryViewModel.validatedWebhookData })

      return redirectTo(request, h, res._links.next_url.href)
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
