import { restore, spy, stub } from 'sinon'
import { CacheService } from '../../src/server/lib/cacheService'

const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const Wreck = require('@hapi/wreck')
const cheerio = require('cheerio')
const FormData = require('form-data')
const createServer = require('../../src/server/index')
const { before, test, suite, after } = exports.lab = Lab.script()

suite('back-link', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await createServer({ data: 'back-link.json', customPath: __dirname })
    await server.initialize()
    await server.start()
  })

  after(async () => {
    await server.stop()
  })
  // test('get request returns configured form page', async () => {
  //   const options = {
  //     method: 'GET',
  //     url: '/basic/start'
  //   }
  //
  //   const response = await server.inject(options)
  //   expect(response.statusCode).to.equal(200)
  //   expect(response.headers['content-type']).to.include('text/html')
  //
  //   const $ = cheerio.load(response.payload)
  //
  //   expect($('h1.govuk-fieldset__heading').text().trim()).to.equal('Licence details Which fishing licence do you want to get?')
  //   expect($('.govuk-radios__item').length).to.equal(3)
  // })
  //
  // test('post requests redirects user to next form page', { timeout: 10000 }, async () => {
  //   const form = new FormData()
  //   form.append('licenceLength', 1)
  //   const options = {
  //     method: 'POST',
  //     url: '/basic/start',
  //     headers: form.getHeaders(),
  //     payload: form.getBuffer()
  //   }
  //   const response = await server.inject(options)
  //   expect(response.statusCode).to.equal(302)
  //   expect(response.headers).to.include('location')
  //   expect(response.headers.location).to.equal('/basic/full-name')
  // })

  test('Back link is displayed on page error', { timeout: 100000 }, async () => {
    const form = new FormData()
    stub(CacheService.prototype, 'getState').callsFake(() => {
      return { progress: ['/back-link/start', '/back-link/full-name'] }
    })

    const options = {
      method: 'POST',
      url: '/back-link/full-name',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)

    const $ = cheerio.load(response.payload)
    expect($('.govuk-back-link').text().trim()).to.equal('Back')
  })

  test('When back link is pressed, the page is removed from progress', { timeout: 100000 }, async () => {
    restore()
    stub(CacheService.prototype, 'getState').callsFake(() => {
      return { progress: ['/back-link/start', '/back-link/full-name', '/back-link/location'] }
    })

    const options = {
      method: 'GET',
      url: '/back-link/full-name'
    }

    const spyMergeState = spy(CacheService.prototype, 'mergeState')
    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    expect(spyMergeState.args[0][1].progress.length).to.equal(2)
  })
})
