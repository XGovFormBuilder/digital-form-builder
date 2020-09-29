import React from 'react'
import { shallow, mount } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import Name from '../client/name'
import sinon from 'sinon'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, describe } = lab

suite.only('Name component', () => {
  describe('with component prop', () => {
    test('renders with correct values', () => {
      const wrapper = mount(<Name component={{ type: 'TextField', name: 'myComponent', title: 'My component' }} id={'an-id'} labelText={'label text'}/>)
      const field = wrapper.find('#an-id').hostNodes()
      expect(wrapper.find('#an-id').hostNodes().exists).to.equal(true)
      expect(wrapper.find('#an-id').hostNodes().exists).to.equal(true)
    })
  })
  test('Renders with', () => {

  })
  test('Without component prop', () => {

  })
  test('Without name prop', () => {

  })
  test('With name prop', () => {

  })
  test('With id prop', () => {

  })
  test('Typing in field updates value', () => {

  })
  test.only('Error message shows up when whitespaces are entered', () => {
    const wrapper = mount(<Name component={{ type: 'TextField', name: 'myComponent', title: 'My component' }} id={'an-id'} labelText={'label text'}/>)
    const field = wrapper.find('#an-id').hostNodes()
    field.simulate('change', { target: { value: `this${randomWhitespaceCharacter()}value${randomWhitespaceCharacter()}has dif${whitespaceCharacters.join('')}ferent spaces${randomWhitespaceCharacter()} in it` } })
    wrapper.update()
    expect(wrapper.find('.govuk-input--error').exists()).to.equal(true)
    expect(wrapper.find('.govuk-form-group--error').exists()).to.equal(true)
    expect(wrapper.find('.govuk-error-message').exists()).to.equal(true)
  })
})

const whitespaceCharacters = ['\u0020',
  '\u00A0',
  '\u2000',
  '\u2001',
  '\u2002',
  '\u2003',
  '\u2004',
  '\u2005',
  '\u2006',
  '\u2007',
  '\u2008',
  '\u2009',
  '\u200A',
  '\u2028',
  '\u205F',
  '\u3000']

const randomWhitespaceCharacter = () => {
  return whitespaceCharacters[Math.floor(Math.random() * whitespaceCharacters.length)]
}
