import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import CheckboxesField from '../../components/checkboxesfield'
const lab = Lab.script()
exports.lab = lab
const { expect } = Code
const { suite, test } = lab

suite('Checkboxes field', () => {
  test('Should construct appropriate model for items', () => {
    const items = [
      { display: 'A thing', value: 'myThing', condition: 'aCondition', hint: 'Jobbie' },
      { display: 'Another thing', value: 'myOtherThing', something: 'Something else' }
    ]
    const def = {
      name: 'myComponent',
      title: 'My component',
      options: {},
      schema: {},
      values: { type: 'static', valueType: 'string', items: items }
    }
    const model = {}
    const underTest = new CheckboxesField(def, model)
    const returned = underTest.getViewModel({ lang: 'en' })

    expect(returned.fieldset).to.equal({
      legend: {
        classes: 'govuk-label--s',
        text: def.title
      }
    })
    expect(returned.items).to.equal([
      { checked: false, text: 'A thing', value: 'myThing', condition: 'aCondition', hint: { html: 'Jobbie' } },
      { checked: false, text: 'Another thing', value: 'myOtherThing', condition: undefined }
    ])
  })
})
