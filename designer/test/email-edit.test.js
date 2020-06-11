import React from 'react'
import { shallow, mount, render } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import EmailEdit from '../client/email-edit'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { after, before, describe, it, suite, test } = lab

suite('Email edit', () => {
  test('renders with correct class', () => {
    expect(shallow(<EmailEdit />).is('.email-edit')).to.equal(true)
  })
})
