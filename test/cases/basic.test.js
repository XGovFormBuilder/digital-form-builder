const Lab = require('lab')
const { expect } = require('code')
const cheerio = require('cheerio')
// const HtmlHelper = require('../html-helper')
const createServer = require('../create-server')
const lab = exports.lab = Lab.script()

lab.experiment('Basic', () => {
  let server

  // Create server before each test
  lab.before(async () => {
    server = await createServer()
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

  lab.test('POST /', async () => {
    const options = {
      method: 'POST',
      url: '/basic',
      payload: {
        licenceLength: 1
      }
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(302)
    expect(response.headers).to.include('location')
    expect(response.headers.location).to.equal('/basic/full-name')
  })
})
