const joi = require('joi')
const Page = require('./index')
const shortid = require('shortid')
const { formSchema } = require('../../../lib/formSchema')
const { serviceName } = require('../../../config')
const { flatten } = require('flat')
import * as querystring from 'querystring'
const { merge } = require('hoek')

class SummaryViewModel {
  constructor (pageTitle, model, state) {
    this.pageTitle = pageTitle

    const relevantPages = []
    const details = []
    let endPage = null

    let nextPage = model.startPage
    while (nextPage?.hasFormComponents) {
      relevantPages.push(nextPage)
      nextPage = nextPage.getNextPage(state)
    }

    [undefined, ...model.sections].forEach((section) => {
      const items = []
      const sectionState = section
        ? (state[section.name] || {})
        : state

      relevantPages.forEach(page => {
        if (page.section === section) { //should this be a filter THEN for each..?
          if (page.hasFormComponents) { //hm.. this is already handled in while(nextPage?.hasFormComponents)..?
            const isRepeatable = page.repeatField
            let repeatItems = []
            page.components.formItems.forEach(component => {

              let item = this.Item(component, sectionState, page, model)
// items.push(item)
              isRepeatable ? repeatItems.push(item) : items.push(item)
              if (component.items) {
                const selectedValue = sectionState[component.name]
                const selectedItem = component.items.filter(i => i.value === selectedValue)[0]
                if (selectedItem && selectedItem.conditional) {
                  selectedItem.conditional.componentCollection.formItems.forEach(cc => {
                    let cItem = this.Item(cc, sectionState, page, model)
                    isRepeatable ? repeatItems.push(cItem) : items.push(cItem)
                  })
                }
              }
            })
            if(repeatItems.length) {
              // const collatePages = repeatItems.map((item, i) => {
              //   return item.map((field, j) => {
              //     return field[j]
              //   })
              // })
              items.push(repeatItems)
            }
          } else if (!(page instanceof SummaryPage) && !page.hasNext) {
            endPage = page
          }
        }
      })
      if (items.length > 0) {
        if(Array.isArray(sectionState)) {
          details.push({
            name: section?.name,
            title: section?.title,
            items: items.map((item, i) => {
              return item.map((field, j) => {
                return field[j]
              })
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

    this.declaration = model.def.declaration
    this.skipSummary = model.def.skipSummary
    this.endPage = endPage

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
      const flatState = flatten(state)
      this.fees = {
        details: applicableFees,
        total: Object.values(applicableFees).map(fee => {
          if (fee.multiplier) {
            const multiplyBy = flatState[fee.multiplier]
            fee.multiplyBy = Number(multiplyBy)
            return fee.multiplyBy * fee.amount
          }
          return fee.amount
        }).reduce((a, b) => a + b)
      }
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
          case 'sheets':
            return { type: 'sheets', outputData: this.sheetsModel(model, output.outputConfiguration, state) }
        }
      })
    }

    this.result = result
    this.details = details
    this.state = state
    this.value = result.value
  }

  notifyModel (model, outputConfiguration, state) {
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

  emailModel (outputOptions) {
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

  sheetsModel (model, outputConfiguration, state) {
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
    const questions = relevantPages.map(page => {
      const category = page.section && page.section.name ? page.section.name : null
      const fields = []
      page.components.formItems.forEach(item => {
        const detail = details.find(d => d.name === category)
        const detailItem = detail.items.find(detailItem => detailItem.name === item.name)
        const answer = (typeof detailItem.rawValue === 'object') ? detailItem.value : detailItem.rawValue
        fields.push({
          key: item.name,
          title: this.toEnglish(item.title),
          type: item.dataType,
          answer
        })

        if (item.items) {
          const selectedItem = item.items.filter(i => i.value === answer)[0]
          if (selectedItem && selectedItem.conditional) {
            selectedItem.conditional.componentCollection.formItems.forEach(cc => {
              const itemDetailItem = detail.items.find(detailItem => detailItem.name === cc.name)
              fields.push({
                key: cc.name,
                title: this.toEnglish(cc.title),
                type: cc.dataType,
                answer: (typeof itemDetailItem.rawValue === 'object') ? itemDetailItem.value : itemDetailItem.rawValue
              })
            })
          }
        }
      })

      let question = ''
      if (page.title) {
        question = this.toEnglish(page.title)
      } else {
        question = page.components.formItems.map(item => this.toEnglish(item.title)).join(', ')
      }

      return {
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

  Item (component, sectionState, page, model, queryString = '') {
    const isRepeatable = page.repeatField
    let returnUrl = `/${model.basePath}/summary`

    let query = {
      returnUrl
    }
    if(isRepeatable && Array.isArray(sectionState)) {
      return sectionState.map((state, i) => {
        const query = {
          returnUrl:`/${model.basePath}/summary`,
          num: i + 1
        }
        let collated = Object.values(state).reduce((acc, p) => ({...acc, p}))
        const qs = `?${querystring.encode(query)}`
        return this.Item(component, collated, page, model, qs)
      })
    }

    return {
      name: component.name,
      path: component.path,
      label: component.localisedString(component.title),
      value: component.getDisplayStringFromState(sectionState),
      rawValue: sectionState[component.name],
      url: `/${model.basePath}${page.path}${queryString}`,
      pageId: `/${model.basePath}${page.path}`,
      type: component.type
    }
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

      if (viewModel.endPage) {
        return h.redirect(`/${model.basePath}${viewModel.endPage.path}`)
      }

      if (viewModel.errors) {
        const errorToFix = viewModel.errors[0]
        const { path } = errorToFix
        const parts = path.split('.')
        const section = parts[0]
        const property = parts[1]
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
          return h.redirect(`/${model.basePath}${pageWithError.path}?returnUrl=/${model.basePath}/summary`)
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
      const summaryViewModel = new SummaryViewModel(this.title, model, state)
      // redirect user to start page if there are incomplete form errors
      if (summaryViewModel.result.error) {
        // default to first defined page
        let startPageRedirect = h.redirect(`/${model.basePath}${model.def.pages[0].path}`)
        const startPage = model.def.startPage
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
        return h.redirect('/status')
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
