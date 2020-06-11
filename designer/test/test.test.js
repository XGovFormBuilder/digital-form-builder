import React from 'react'
import { shallow, mount, render } from 'enzyme'
import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
const { expect } = Code
const lab = Lab.script()
exports.lab = lab
const { after, before, describe, it, suite, test } = lab

class Foo extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div className='foo' />
    )
  }
}

suite('A suite', () => {
  test('calls componentDidMount', () => {
    const wrapper = mount(<Foo />)
    expect(shallow(<Foo />).contains(<div className='foo' />)).to.equal(true)
  })
})
