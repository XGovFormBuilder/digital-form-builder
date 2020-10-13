import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import { Logger } from '../.dist'
import sinon from 'sinon'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab

const { afterEach, suite, test } = lab

suite('logger', () => {
  const server = {
    log: sinon.spy()
  }
  const identifier = 'MyIdentifier'
  const message = 'My message'
  const logger = new Logger(server, identifier)

  afterEach(() => {
    server.log.resetHistory()
  })

  test('should log an error level message', () => {
    logger.error(message)
    assertMessageLoggedAt('error')
  })

  test('should log a warn level message', () => {
    logger.warn(message)
    assertMessageLoggedAt('warn')
  })

  test('should log an info level message', () => {
    logger.info(message)
    assertMessageLoggedAt('info')
  })

  test('should log a debug level message', () => {
    logger.debug(message)
    assertMessageLoggedAt('debug')
  })

  function assertMessageLoggedAt (level) {
    expect(server.log.callCount).to.equal(1)
    expect(server.log.firstCall.args[0]).to.equal([level, identifier])
    expect(server.log.firstCall.args[1]).to.equal(message)
  }
})
