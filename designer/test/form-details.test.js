import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Data } from 'digital-form-builder-model/lib/data-model'
import { assertRadioButton, assertTextInput } from './helpers/element-assertions'
import FormDetails from '../client/form-details'

import sinon from 'sinon'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { afterEach, beforeEach, describe, suite, test } = lab

suite('Form details', () => {
  describe('rendering', () => {
    const data = new Data({})

    afterEach(() => {
      data.feedbackForm = false
    })

    test('Renders a form with the appropriate initial inputs', () => {
      const wrapper = shallow(<FormDetails data={data} />)
      assertTextInput(wrapper.find('#form-title'), 'form-title')
      assertRadioButton(wrapper.find('#feedback-yes'), 'feedback-yes', 'true', 'Yes')
      assertRadioButton(wrapper.find('#feedback-no'), 'feedback-no', 'false', 'No')
    })

    test('Renders pre-populated name input when form already has a name', () => {
      data.name = 'My form'
      const wrapper = shallow(<FormDetails data={data} />)
      assertTextInput(wrapper.find('#form-title'), 'form-title', 'My form')
    })

    test('Entered form name is displayed', () => {
      data.name = 'My form'
      const wrapper = shallow(<FormDetails data={data} />)
      wrapper.find('#form-title').simulate('blur', { target: { value: 'New name' } })
      assertTextInput(wrapper.find('#form-title'), 'form-title', 'New name')
    })

    test('Renders Feedback form \'yes\' checked when form is a feedback form', () => {
      data.feedbackForm = true
      const wrapper = shallow(<FormDetails data={data} />)
      assertRadioButton(wrapper.find('#feedback-yes'), 'feedback-yes', 'true', 'Yes', { 'defaultChecked': true })
      assertRadioButton(wrapper.find('#feedback-no'), 'feedback-no', 'false', 'No', { 'defaultChecked': false })
    })

    test('Renders Feedback \'no\' checked when form is not a feedback form', () => {
      const wrapper = shallow(<FormDetails data={data} />)
      assertRadioButton(wrapper.find('#feedback-yes'), 'feedback-yes', 'true', 'Yes', { 'defaultChecked': false })
      assertRadioButton(wrapper.find('#feedback-no'), 'feedback-no', 'false', 'No', { 'defaultChecked': true })
    })

    test('Renders Feedback url input when form is not a feedback form', () => {
      const wrapper = shallow(<FormDetails data={data} />)
      assertTextInput(wrapper.find('#feedback-url'), 'feedback-url')
    })

    test('Does not render Feedback url input when form is a feedback form', () => {
      data.feedbackForm = true
      const wrapper = shallow(<FormDetails data={data} />)
      expect(wrapper.find('#feedback-url').exists()).to.equal(false)
    })

    test('Renders populated Feedback url input when present and form is not a feedback form', () => {
      data.setFeedbackUrl('/feedback')
      const wrapper = shallow(<FormDetails data={data} />)
      assertTextInput(wrapper.find('#feedback-url'), 'feedback-url', '/feedback')
    })
  })

  describe('on submit', () => {
    let data
    beforeEach(() => {
      data = new Data({})
      data.clone = sinon.stub().returns(data)
      data.save = sinon.stub().resolves(data)
    })

    test('name should be set correctly when unchanged', async () => {
      data.name = 'My form'
      const wrapper = shallow(<FormDetails data={data} />)
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].name).to.equal('My form')
    })

    test('name should be set correctly when changed', async () => {
      data.name = 'My form'
      const wrapper = shallow(<FormDetails data={data} />)
      wrapper.find('#form-title').simulate('blur', { target: { value: 'New name' } })
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].name).to.equal('New name')
    })

    test('feedbackForm should be set correctly when unchanged', async () => {
      data.feedbackForm = true
      const wrapper = shallow(<FormDetails data={data} />)
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].feedbackForm).to.equal(true)
    })

    test('feedbackForm should be set correctly when changed to true', async () => {
      const wrapper = shallow(<FormDetails data={data} />)
      wrapper.find('#feedback-yes').simulate('click')
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].feedbackForm).to.equal(true)
    })

    test('feedbackForm should be set correctly when changed to false', async () => {
      data.feedbackForm = true
      const wrapper = shallow(<FormDetails data={data} />)
      wrapper.find('#feedback-no').simulate('click')
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].feedbackForm).to.equal(false)
    })

    test('Feedback url should be cleared when changing to a feedback form', async () => {
      data.setFeedbackUrl('/feedback', true)
      const wrapper = shallow(<FormDetails data={data} />)
      wrapper.find('#feedback-yes').simulate('click')
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].feedbackUrl).to.equal(undefined)
    })

    test('feedbackUrl should be set correctly when unchanged', async () => {
      data.setFeedbackUrl('/feedback')
      const wrapper = shallow(<FormDetails data={data} />)
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].feedbackUrl).to.equal('/feedback')
    })

    test('feedbackUrl should be set correctly when changed', async () => {
      data.setFeedbackUrl('/feedback')
      const wrapper = shallow(<FormDetails data={data} />)
      wrapper.find('#feedback-url').simulate('change', { target: { value: '/feedback-2' } })
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0].feedbackUrl).to.equal('/feedback-2')
    })

    test('Updated data should be saved correctly and saved data should be passed to callback', async () => {
      data.name = 'My form'
      const clonedData = {
        setFeedbackUrl: sinon.spy()
      }
      data.clone.returns(clonedData)
      const savedData = sinon.spy()
      data.save.resolves(savedData)

      const onCreate = sinon.spy()
      const wrapper = shallow(<FormDetails data={data} onCreate={onCreate} />)
      wrapper.find('#form-title').simulate('blur', { target: { value: 'New name' } })
      await wrapper.instance().onSubmit({ preventDefault: sinon.spy() })

      expect(data.save.callCount).to.equal(1)
      expect(data.save.firstCall.args[0]).to.equal(clonedData)
      expect(clonedData.name).to.equal('New name')

      expect(onCreate.callCount).to.equal(1)
      expect(onCreate.firstCall.args[0]).to.equal(savedData)
    })
  })
})
