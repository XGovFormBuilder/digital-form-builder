import * as Code from '@hapi/code'
const { expect } = Code

export function assertDiv (wrapper, classes) {
  assertElement(wrapper, 'div', classes)
}

export function assertText (wrapper, text) {
  expect(wrapper.text()).to.equal(text)
}

export function assertClasses (wrapper, classes) {
  const certainClasses = classes??[]
  certainClasses.forEach(className => {
    expect(wrapper.hasClass(className), `${wrapper.name()} ${wrapper.prop('id') || ''} to have class ${className}`).to.equal(true)
  })
}

export function assertSpan (wrapper, classes) {
  assertElement(wrapper, 'span', classes)
}

export function assertLabel (wrapper, text) {
  assertElement(wrapper, 'label', ['govuk-label'])
  expect(wrapper.text()).to.equal(text)
}

export function assertLink (wrapper, id, expectedText) {
  expect(wrapper.name()).to.equal('a')
  expect(wrapper.prop('id')).to.equal(id)
  expect(wrapper.text()).to.equal(expectedText)
  expect(wrapper.prop('href')).to.equal('#')
}

export function assertRequiredTextInput (wrapper, id, expectedValue) {
  assertTextInput(wrapper, id, expectedValue)
  expect(Object.keys(wrapper.props()).includes('required')).to.equal(true)
}

export function assertTextInput (wrapper, id, expectedValue) {
  expect(wrapper.name()).to.equal('input')
  expect(wrapper.prop('id')).to.equal(id)
  expect(wrapper.prop('type')).to.equal('text')
  expect(wrapper.prop('defaultValue')).to.equal(expectedValue)
}

export function assertSelectInput (wrapper, id, expectedFieldOptions, expectedValue) {
  expect(wrapper.name()).to.equal('select')
  expect(wrapper.prop('id')).to.equal(id)
  const options = wrapper.children()
  expect(options.length).to.equal(expectedFieldOptions.length + 1)
  assertOption(options.at(0), undefined, '')
  expectedFieldOptions.forEach((expectedOption, index) => {
    assertOption(options.at(index + 1), expectedOption.value, expectedOption.text)
  })
  expect(wrapper.prop('value')).to.equal(expectedValue)
}

export function assertCheckboxInput (wrapper, id, value, checked) {
  expect(wrapper.name()).to.equal('input')
  expect(wrapper.prop('type')).to.equal('checkbox')
  expect(wrapper.prop('id')).to.equal(id)
  expect(wrapper.prop('value')).to.equal(value)
  expect(wrapper.prop('checked'), `checkbox ${id} to be ${checked ? 'checked' : 'not checked'}`).to.equal(checked || '')
}

export function assertOption (wrapper, expectedValue, expectedText) {
  expect(wrapper.name()).to.equal('option')
  expect(wrapper.prop('value')).to.equal(expectedValue)
  expect(wrapper.text()).to.equal(expectedText)
}

function assertElement (wrapper, elementName, classes) {
  expect(wrapper.name()).to.equal(elementName)
  assertClasses(wrapper, classes)
}
