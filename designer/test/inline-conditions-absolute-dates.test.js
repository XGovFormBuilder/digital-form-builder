import { shallow } from 'enzyme'
import * as Lab from '@hapi/lab'
import * as Code from '@hapi/code'
import { assertRequiredNumberInput, assertSelectInput } from './helpers/element-assertions'
import sinon from 'sinon'
import momentTz from 'moment-timezone'
import {
  absoluteDateOperators,
  absoluteDateTimeOperators,
  absoluteTimeOperators
} from '../client/conditions/inline-conditions-absolute-dates'
import { Value } from '../client/conditions/inline-condition-values'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { beforeEach, suite, test, describe } = lab

suite('Inline conditions absolute date and time value inputs', () => {
  let updateValueCallback

  beforeEach(() => {
    updateValueCallback = sinon.spy()
  })

  describe('absolute date operators', () => {
    Object.keys(absoluteDateOperators).forEach(operator => {
      test(`should display the expected inputs for '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-02')
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        assertRequiredNumberInput(wrapper.find('#cond-value-year'), 'cond-value-year', '2020')
        assertRequiredNumberInput(wrapper.find('#cond-value-month'), 'cond-value-month', '01')
        assertRequiredNumberInput(wrapper.find('#cond-value-day'), 'cond-value-day', '02')
      })

      test(`specifying all inputs in order should save the expected value for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-day').simulate('change', { target: { value: '01' } })
        wrapper.find('#cond-value-month').simulate('change', { target: { value: '11' } })
        wrapper.find('#cond-value-year').simulate('change', { target: { value: '2018' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2018-11-01'))
      })

      test(`specifying some inputs should not trigger a save '${operator}' operator`, () => {
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-month').simulate('change', { target: { value: '11' } })
        wrapper.find('#cond-value-year').simulate('change', { target: { value: '2018' } })

        expect(updateValueCallback.callCount).to.equal(0)
      })

      test(`Days and months should be left padded with zeros for '${operator}' operator`, () => {
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-day').simulate('change', { target: { value: '1' } })
        wrapper.find('#cond-value-month').simulate('change', { target: { value: '2' } })
        wrapper.find('#cond-value-year').simulate('change', { target: { value: '2018' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2018-02-01'))
      })

      test(`specifying all inputs out of order should save the expected value for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-month').simulate('change', { target: { value: '11' } })
        wrapper.find('#cond-value-year').simulate('change', { target: { value: '2018' } })
        wrapper.find('#cond-value-day').simulate('change', { target: { value: '01' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2018-11-01'))
      })

      test(`updating day should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-02')
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('#cond-value-day').simulate('change', { target: { value: '12' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-01-12'))
      })

      test(`updating month should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-02')
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('#cond-value-month').simulate('change', { target: { value: '12' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-12-02'))
      })

      test(`updating year should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-02')
        const operatorConfig = absoluteDateOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('#cond-value-year').simulate('change', { target: { value: '2012' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2012-01-02'))
      })
    })
  })

  describe('absolute time operators', () => {
    Object.keys(absoluteTimeOperators).forEach(operator => {
      test(`should display the expected inputs for '${operator}' operator`, () => {
        const existingValue = new Value('13:46')
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        assertRequiredNumberInput(wrapper.find('#cond-value-hours'), 'cond-value-hours', '13')
        assertRequiredNumberInput(wrapper.find('#cond-value-minutes'), 'cond-value-minutes', '46')
      })

      test(`specifying all inputs in order should save the expected value for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-hours').simulate('change', { target: { value: '01' } })
        wrapper.find('#cond-value-minutes').simulate('change', { target: { value: '11' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('01:11'))
      })

      test(`hours and minutes should be padded with zeros for '${operator}' operator`, () => {
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-hours').simulate('change', { target: { value: '1' } })
        wrapper.find('#cond-value-minutes').simulate('change', { target: { value: '2' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('01:02'))
      })

      test(`specifying all inputs out of order should save the expected value for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-minutes').simulate('change', { target: { value: '11' } })
        wrapper.find('#cond-value-hours').simulate('change', { target: { value: '1' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('01:11'))
      })

      test(`specifying minutes only should not trigger a save '${operator}' operator`, () => {
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-minutes').simulate('change', { target: { value: '11' } })

        expect(updateValueCallback.callCount).to.equal(0)
      })

      test(`specifying hours only should not trigger a save '${operator}' operator`, () => {
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-hours').simulate('change', { target: { value: '11' } })

        expect(updateValueCallback.callCount).to.equal(0)
      })

      test(`updating hours should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('13:46')
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('#cond-value-hours').simulate('change', { target: { value: '12' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('12:46'))
      })

      test(`updating minutes should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('13:46')
        const operatorConfig = absoluteTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('#cond-value-minutes').simulate('change', { target: { value: '12' } })

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('13:12'))
      })
    })
  })

  describe('absolute date time operators', () => {
    Object.keys(absoluteDateTimeOperators).forEach(operator => {
      test(`should display the expected inputs for '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-03T13:46:23.463')
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        const absoluteDateValues = wrapper.find('AbsoluteDateValues')
        expect(absoluteDateValues.exists()).to.equal(true)
        expect(absoluteDateValues.prop('value')).to.equal(new Value('2020-01-03'))

        const absoluteTimeValues = wrapper.find('AbsoluteTimeValues')
        expect(absoluteTimeValues.exists()).to.equal(true)
        expect(absoluteTimeValues.prop('value')).to.equal(new Value('13:46'))

        assertSelectInput(wrapper.find('#cond-value-tz'), 'cond-value-tz',
          momentTz.tz.names().map(tz => ({ value: tz, text: tz })),
          'Europe/London')
      })

      test(`specifying date and time inputs in order should save the expected value for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('AbsoluteDateValues').prop('updateValue')(new Value('2020-03-13'))
        wrapper.find('AbsoluteTimeValues').prop('updateValue')(new Value('02:17'))

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-03-13T02:17:00.000Z'))
      })

      test(`Value should apply daylight savings in the default time zone for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('AbsoluteDateValues').prop('updateValue')(new Value('2020-07-13'))
        wrapper.find('AbsoluteTimeValues').prop('updateValue')(new Value('02:17'))

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-07-13T01:17:00.000Z'))
      })

      test(`Value should have the specified time zone when specified for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('#cond-value-tz').simulate('change', { target: { value: 'America/New_York' } })
        wrapper.find('AbsoluteDateValues').prop('updateValue')(new Value('2020-07-13'))
        wrapper.find('AbsoluteTimeValues').prop('updateValue')(new Value('02:17'))

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-07-13T06:17:00.000Z'))
      })

      test(`specifying all inputs out of order should save the expected value for adding with '${operator}' operator`, () => {
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(undefined, updateValueCallback))

        wrapper.find('AbsoluteTimeValues').prop('updateValue')(new Value('02:17'))
        wrapper.find('AbsoluteDateValues').prop('updateValue')(new Value('2020-03-13'))

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-03-13T02:17:00.000Z'))
      })

      test(`updating time should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-03T13:46:23.463')
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('AbsoluteTimeValues').prop('updateValue')(new Value('02:17'))

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2020-01-03T02:17:00.000Z'))
      })

      test(`updating date should save the expected value for editing with '${operator}' operator`, () => {
        const existingValue = new Value('2020-01-03T13:46:23.463')
        const operatorConfig = absoluteDateTimeOperators[operator]
        const wrapper = shallow(operatorConfig.renderComponent(existingValue, updateValueCallback))

        wrapper.find('AbsoluteDateValues').prop('updateValue')(new Value('2019-02-06'))

        expect(updateValueCallback.callCount).to.equal(1)
        expect(updateValueCallback.firstCall.args.length).to.equal(1)
        expect(updateValueCallback.firstCall.args[0]).to.equal(new Value('2019-02-06T13:46:00.000Z'))
      })
    })
  })
})
