import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import NationalInsuranceNumberField from '../../components/nationalinsurancenumberfield'
const lab = Lab.script()
exports.lab = lab
const { expect } = Code
const { suite, test } = lab
const joi = require('joi')

const nationalInsuranceNumbersValid = [
  'AA123456C',
  'AA 12 34 56 C',
  'AA 123456C',
  'AA 123456 C'
]

const nationalInsuranceNumbersInvalid = [
  'A',
  '1',
  'AA123456CC'
]

suite('national insurance number field', () => {
  test('Should construct appropriate view model', () => {
    const def = { name: 'myComponent', title: 'My Component', schema: {}, options: {} }
    const model = {}

    const underTest = new NationalInsuranceNumberField(def, model)
    const viewModel = underTest.getViewModel({ lang: 'en' })

    expect(viewModel).to.equal(
      {
        classes: 'govuk-input--width-10',
        id: 'myComponent',
        label: {
          classes: 'govuk-label--s',
          text: 'My Component'
        },
        name: 'myComponent',
        type: 'ni',
        value: undefined
      }

    )
  })

  nationalInsuranceNumbersValid.forEach((ni) => {
    test('should validate ' + ni + ' as a correct NI number', () => {
      const def = { name: 'myComponent', title: 'My Component', schema: {}, options: {} }
      const model = {}

      const underTest = new NationalInsuranceNumberField(def, model)

      const testSchema = joi.object({
        value: joi.string()
          .regex(new RegExp(underTest.schema.regex))
      })

      const result = testSchema.validate({ value: ni })
      expect(result.error).to.equal(null)
    })
  })

  nationalInsuranceNumbersInvalid.forEach((ni) => {
    test('incorrect NI number ' + ni + ' should fail validation', () => {
      const def = { name: 'myComponent', title: 'My Component', schema: {}, options: {} }
      const model = {}

      const underTest = new NationalInsuranceNumberField(def, model)

      const testSchema = joi.object({
        value: joi.string()
          .regex(new RegExp(underTest.schema.regex))
      })

      const result = testSchema.validate({ value: ni })
      expect(result.error).to.not.equal(null)
    })
  })
})
