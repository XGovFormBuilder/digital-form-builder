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
    expect(wrapper.hasClass(className), `${getTagName(wrapper)} ${getProperty(wrapper, 'id') || ''} to have class ${className}`).to.equal(true)
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
  expect(getTagName(wrapper)).to.equal('a')
  expect(getProperty(wrapper, 'id')).to.equal(id)
  expect(wrapper.text()).to.equal(expectedText)
  expect(getProperty(wrapper, 'href')).to.equal('#')
}

export function assertRequiredTextInput (wrapper, id, expectedValue, attrs) {
  assertTextInput(wrapper, id, expectedValue)
  expect(getPropertyNames(wrapper).includes('required')).to.equal(true)
}

export function assertTextInput (wrapper, id, expectedValue, attrs) {
  expect(getTagName(wrapper)).to.equal('input')
  expect(getProperty(wrapper, 'id')).to.equal(id)
  expect(getProperty(wrapper, 'type')).to.equal('text')
  expect(getProperty(wrapper, 'defaultValue')).to.equal(expectedValue)
  assertAdditionalAttributes(attrs, wrapper)
}

export function assertTextArea (wrapper, id, expectedValue, attrs) {
  expect(getTagName(wrapper)).to.equal('textarea')
  expect(getProperty(wrapper, 'id')).to.equal(id)
  expect(getText(wrapper)).to.equal(expectedValue)
  assertAdditionalAttributes(attrs, wrapper)
}

export function assertSelectInput (wrapper, id, expectedFieldOptions, expectedValue) {
  expect(getTagName(wrapper)).to.equal('select')
  expect(getProperty(wrapper, 'id')).to.equal(id)
  const options = wrapper.children()
  expect(options.length).to.equal(expectedFieldOptions.length)
  expectedFieldOptions.forEach((expectedOption, index) => {
    assertOption(options.at(index), expectedOption.value, expectedOption.text)
  })
  expect(getProperty(wrapper, 'value')).to.equal(expectedValue)
}

export function assertCheckboxInput (wrapper, id, value, checked, attrs) {
  expect(getTagName(wrapper)).to.equal('input')
  expect(getProperty(wrapper, 'type')).to.equal('checkbox')
  expect(getProperty(wrapper, 'id')).to.equal(id)
  expect(getProperty(wrapper, 'value')).to.equal(value)
  expect(getProperty(wrapper, 'checked'), `checkbox ${id} to be ${checked ? 'checked' : 'not checked'}`).to.equal(checked)
  assertAdditionalAttributes(attrs, wrapper)
}

export function assertOption (wrapper, expectedValue, expectedText) {
  expect(getTagName(wrapper)).to.equal('option')
  expect(getProperty(wrapper, 'value')).to.equal(expectedValue)
  expect(wrapper.text()).to.equal(expectedText)
}

function assertElement (wrapper, elementName, classes) {
  expect(getTagName(wrapper)).to.equal(elementName)
  assertClasses(wrapper, classes)
}

function assertAdditionalAttributes (attrs, wrapper) {
  Object.keys(attrs || {}).forEach(key => {
    expect(getProperty(wrapper, key)).to.equal(attrs[key])
  })
}

/** ****** Adapters for handling standard Enzyme (shallow) vs Cheerio (render) wrappers. Eugh! ***********/
function getTagName (wrapper) {
  if (typeof wrapper.name === 'function') {
    return wrapper.name()
  }
  return wrapper.name
}

function getProperty (wrapper, name) {
  if (typeof wrapper.prop === 'function') {
    return wrapper.prop(name)
  }
  const propertyMapping = propertyMappings[name]
  return propertyMapping ? propertyMapping(wrapper.attribs) : wrapper.attribs[name]
}

function getPropertyNames (wrapper) {
  return typeof wrapper.props === 'function' ? Object.keys(wrapper.props()) : Object.keys(wrapper.attribs)
}

function getText (wrapper) {
  return typeof wrapper.text === 'function' ? wrapper.text() : wrapper.children?.[0]?.data??''
}

const propertyMappings = {
  defaultValue: attribs => attribs['value'],
  checked: attribs => Object.keys(attribs).includes('checked') || ''
}
