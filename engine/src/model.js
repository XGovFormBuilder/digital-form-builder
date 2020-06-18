const joi = require('joi')
const path = require('path')
const schema = require('./schema')
const Page = require('./page')
const Parser = require('expr-eval').Parser

class Model {
  constructor (def, options) {
    const result = schema.validate(def, { abortEarly: false })

    //TODO:- throw/catch this properly 🤦🏻‍
    if (result.error) {
      throw result.error
    }

    // Make a clone of the shallow copy returned
    // by joi so as not to change the source data.
    def = JSON.parse(JSON.stringify(result.value))

    // Add default lists
    def.lists.push({
      name: '__yesNo',
      title: 'Yes/No',
      type: 'boolean',
      items: [
        {
          text: 'Yes',
          value: true
        },
        {
          text: 'No',
          value: false
        }
      ]
    })

    this.def = def
    this.lists = def.lists
    this.sections = def.sections
    this.options = options
    this.name = def.name
    this.values = result.value

    if (options.defaultPageController) {
      const defaultPageControllerPath = path.resolve(options.relativeTo, options.defaultPageController)
      this.DefaultPageController = require(defaultPageControllerPath)
    }

    this.basePath = options.basePath

    this.conditions = {}
    def.conditions.forEach(conditionDef => {
      const condition = this.makeCondition(conditionDef)
      this.conditions[condition.name] = condition
    })

    // this.expressions = {}
    // def.expressions.forEach(expressionDef => {
    //   const expression = this.makeExpression(expressionDef)
    //   this.expressions[expression.name] = expression
    // })

    this.pages = def.pages.map(pageDef => this.makePage(pageDef))
    this.startPage = this.pages.find(page => page.path === def.startPage)
  }

  makeSchema (state) {
    // Build the entire model schema
    // from the individual pages/sections
    return this.makeFilteredSchema(state, this.pages)
  }

  makeFilteredSchema (state, relevantPages) {
    // Build the entire model schema
    // from the individual pages/sections
    let schema = joi.object().required()
    ;[undefined].concat(this.sections).forEach(section => {
      const sectionPages = relevantPages.filter(page => page.section === section)

      if (sectionPages.length > 0) {
        if (section) {
          const isRepeatable = sectionPages.find(page => page.pageDef.repeatField)

          let sectionSchema = joi.object().required()
          sectionPages.forEach(sectionPage => {
            sectionSchema = sectionSchema.concat(sectionPage.stateSchema)
          })
          if (isRepeatable) {
            sectionSchema = joi.array().items(sectionSchema)
          }
          schema = schema.append({
            [section.name]: sectionSchema
          })
        } else {
          sectionPages.forEach(sectionPage => {
            schema = schema.concat(sectionPage.stateSchema)
          })
        }
      }
    })

    return schema
  }

  makePage (pageDef) {
    if (pageDef.controller) {
      const pageControllerPath = path.resolve(this.options.relativeTo, pageDef.controller)
      const PageController = require(pageControllerPath)
      return new PageController(this, pageDef)
    }
    if (this.DefaultPageController) {
      const DefaultPageController = this.DefaultPageController
      return new DefaultPageController(this, pageDef)
    }
    return new Page(this, pageDef)
  }

  makeCondition (condition) {
    const parser = new Parser({
      operators: {
        logical: true
      }
    })
    const { name, value } = condition
    const expr = parser.parse(value)

    const fn = (value) => {
      const ctx = new EvaluationContext(this.conditions, value)
      try {
        return expr.evaluate(ctx)
      } catch (err) {
        return false
      }
    }

    return {
      name,
      value,
      expr,
      fn
    }
  }

  get conditionOptions () { return { allowUnknown: true, presence: 'required' } }
}

class EvaluationContext {
  constructor (conditions, value) {
    Object.assign(this, value)

    for (const key in conditions) {
      Object.defineProperty(this, key, {
        get () {
          return conditions[key].fn(value)
        }
      })
    }
  }
}

module.exports = Model
