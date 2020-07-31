import React from 'react'
import { shallow, mount } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { stub, restore } from 'sinon'
import NewConfig from '../client/new-config'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test, beforeEach } = lab

const configurations = [{
  'Key': '111.json',
  'LastModified': '2020-08-03T14:39:45.000Z' },
{
  'Key': '123.json',
  'LastModified': '2020-08-03T14:18:50.000Z'
},
{
  'Key': '1234.json',
  'LastModified': '2020-08-03T14:20:48.000Z'
}]

suite('New configuration screen', () => {
  beforeEach(() => {
    restore()
  })

  test('Should show no existing configurations found message', () => {
    stub(NewConfig.prototype, 'fetchConfigurations').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve({})
      })
    })
    const wrapper = shallow(<NewConfig />)
    expect(wrapper.find('#hint-none-found').exists()).to.equal(true)
  })

  const wait = () => new Promise(resolve => setTimeout(resolve))

  test('Loads configurations into select', () => {
    stub(NewConfig.prototype, 'fetchConfigurations').callsFake(() => {
      return new Promise((resolve, reject) => {
        resolve(configurations)
      })
    })
    const wrapper = shallow(<NewConfig />)

    return wait().then(() => {
      wrapper.update()
      expect(wrapper.state('configs')).to.have.length(3)
      expect(wrapper.find('option')).to.have.length(4)
    })
  })

  test('Button is disabled and shows a message when input matches an existing configuration', () => {
    stub(NewConfig.prototype, 'loadConfigurations')
    const wrapper = shallow(<NewConfig />)
    wrapper.setState({ configs: configurations })
    const input = wrapper.find('input')
    input.simulate('change', { target: { value: '111' } })
    expect(wrapper.find('#error-already-exists').exists()).to.equal(true)
  })

  test(`Input replaces whitespace with '-' on input change`, () => {
    stub(NewConfig.prototype, 'loadConfigurations')
    const wrapper = mount(<NewConfig />)
    let input = wrapper.find('input')
    input.simulate('change', { target: { value: 'string with spaces' } })
    wrapper.update()
    expect(wrapper.state('newName')).to.be.equal('string-with-spaces')
  })
})
