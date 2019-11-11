const Lab = require('lab')
const { expect } = require('code')
const cheerio = require('cheerio')
const FormData = require('form-data')
// const HtmlHelper = require('../html-helper')
const createServer = require('./../../server/index')
const lab = exports.lab = Lab.script()

lab.experiment('Basic', () => {
  let server

  // Create server before each test
  lab.before(async () => {
    server = await createServer({ data: 'basic.json', customPath: __dirname })
  })

  lab.test('GET /', async () => {
    const options = {
      method: 'GET',
      url: '/basic'
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    expect(response.headers['content-type']).to.include('text/html')

    const $ = cheerio.load(response.payload)

    expect($('h1.govuk-fieldset__heading').text().trim()).to.equal('Licence details Which fishing licence do you want to get?')
    expect($('.govuk-radios__item').length).to.equal(3)
  })

  lab.test('POST /', { timeout: 10000 }, async () => {
    let form = new FormData()
    form.append('licenceLength', 1)
    const options = {
      method: 'POST',
      url: '/basic',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)
    expect(response.statusCode).to.equal(302)
    expect(response.headers).to.include('location')
    expect(response.headers.location).to.equal('/basic/full-name')
  })
})
