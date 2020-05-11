const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const cheerio = require('cheerio')
const FormData = require('form-data')
const createServer = require('./../../server/index')
const { before, test, suite, after } = exports.lab = Lab.script()

suite('requests', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await createServer({ data: 'basic.json', customPath: __dirname })
    await server.start()
  })

  after(async () => {
    await server.stop()
  })
  test('get request returns configured form page', async () => {
    const options = {
      method: 'GET',
      url: '/basic/start'
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    expect(response.headers['content-type']).to.include('text/html')

    const $ = cheerio.load(response.payload)

    expect($('h1.govuk-fieldset__heading').text().trim()).to.equal('Licence details Which fishing licence do you want to get?')
    expect($('.govuk-radios__item').length).to.equal(3)
  })

  test('post requests redirects user to next form page', { timeout: 10000 }, async () => {
    let form = new FormData()
    form.append('licenceLength', 1)
    const options = {
      method: 'POST',
      url: '/basic/start',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)
    expect(response.statusCode).to.equal(302)
    expect(response.headers).to.include('location')
    expect(response.headers.location).to.equal('/basic/full-name')
  })
})
