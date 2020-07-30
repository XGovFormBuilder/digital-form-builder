import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import ComponentCreate from '../client/component-create'
import { Data } from 'digital-form-builder-model/lib/data-model'
import sinon from 'sinon'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test } = lab

suite('Component create', () => {
  const data = new Data({})
  const page = { path: '/1' }
  const generatedId = 'DMaslknf'

  beforeEach(() => {
    data.getId = sinon.stub()
    data.getId.resolves(generatedId)
  })

  test('Should display form with component types in alphabetical order', () => {
    const wrapper = shallow(<ComponentCreate data={data} page={page} />)
    const form = wrapper.find('form')

    const componentTypeInput = form.find('select')
    let lastDisplayedTitle = ''
    componentTypeInput.find('options').forEach(type => {
      expect(lastDisplayedTitle.localeCompare(type.title)).equal.to(-1)
      lastDisplayedTitle = type.title
    })

    expect(wrapper.find('ComponentTypeEdit').exists()).to.equal(false)
  })

  test('Selecting a component type should display the ComponentTypeEdit component', async flags => {
    const onInit = () => {
      const form = wrapper.find('form')

      form.find('select').simulate('change', { target: { value: 'TextField' } })

      const componentTypeEdit = wrapper.find('ComponentTypeEdit')
      expect(componentTypeEdit.exists()).to.equal(true)
      expect(componentTypeEdit.prop('page')).to.equal(page)
      expect(componentTypeEdit.prop('component')).to.equal({ type: 'TextField', name: generatedId })
      expect(componentTypeEdit.prop('data')).to.equal(data)
      expect(Object.keys(componentTypeEdit.props()).length).to.equal(3)
    }
    const wrappedOnInit = flags.mustCall(onInit, 1)
    const wrapper = shallow(<ComponentCreate data={data} page={page} onInit={wrappedOnInit} />)
  })
})
