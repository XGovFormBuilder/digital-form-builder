import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import UrlField from '../../components/urlfield'
const lab = Lab.script()
exports.lab = lab
const { expect } = Code
const { suite, test } = lab
const joi = require('joi')
const validUrls = require('./urls-valid')

suite('url field', () => {
  test('Should construct appropriate view model', () => {
    const def = { name: 'myComponent', title: 'My Component', schema: {}, options: {} }
    const model = {}

    const underTest = new UrlField(def, model)
    const viewModel = underTest.getViewModel({ lang: 'en' })

    expect(viewModel).to.equal(
      {
        classes: 'govuk-input--width-20',
        id: 'myComponent',
        label: {
          classes: 'govuk-label--s',
          text: 'My Component'
        },
        name: 'myComponent',
        type: 'url',
        value: undefined
      }
    )
  })

  validUrls.forEach((url) => {
    test(url + ' should be validated as a correct url', () => {
      const def = { name: 'myComponent', title: 'My Component', schema: {}, options: {} }
      const model = {}

      const underTest = new UrlField(def, model)

      const testSchema = joi.object({
        value: joi.string()
          .regex(new RegExp(underTest.schema.regex))
      })

      const result = testSchema.validate({ value: url })
      expect(result.error).to.equal(null)
    })
  })
})
