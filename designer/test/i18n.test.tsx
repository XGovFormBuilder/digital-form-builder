import React from 'react'
import { shallow } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import sinon from 'sinon'

import Backend from 'i18next-http-backend'
import { withI18n, i18n, initI18n } from '../client/i18n'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { suite, test } = lab

suite('I18n', () => {
  const i18nSettings = {
    lng: 'cy',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    resources: {
      cy: {
        translation: {
          Test: 'Prawf'
        }
      }
    }
  }

  test('withI18n HOC passes down i18n translation function', () => {
    function Component ({ i18n }) {
      return <div>{i18n('Test')}</div>
    }

    const WithI18nComponent = withI18n(Component)
    const wrapper = shallow(<WithI18nComponent />)
    expect(wrapper.find(Component).prop('i18n')).to.exist()
  })

  test('withI18n translation is correct', () => {
    i18n.init(i18nSettings)

    function Component ({ i18n }) {
      return <div>{i18n('Test')}</div>
    }

    const WithI18nComponent = withI18n(Component)
    const wrapper = shallow(<WithI18nComponent />)
    const translation = wrapper.find(Component).prop('i18n')('Test')
    expect(translation).to.exist(i18nSettings.resources.cy.translation.Test)
  })

  test('initializes i18n correctly', () => {
    const mockI18n = {
      use: sinon.stub().returnsThis(),
      init: sinon.stub().returnsThis()
    }

    initI18n(mockI18n)

    expect(mockI18n.use.firstCall.args[0]).to.equal(Backend)
    expect(mockI18n.init.firstCall.args[0]).to.equal({
      lng: 'en',
      fallbackLng: 'en',
      debug: false,
      interpolation: {
        escapeValue: false
      },
      backend: {
        loadPath: '/assets/translations/{{lng}}.{{ns}}.json'
      }
    })
  })
})
