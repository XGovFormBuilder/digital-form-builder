const Lab = require('lab')
const { expect } = require('code')
const cheerio = require('cheerio')
const createServer = require('../create-server')
const lab = exports.lab = Lab.script()
const data = require('./textfield.json')

lab.experiment('Text field', () => {
  let server

  lab.before(async () => {
    server = await createServer(data)
  })

  lab.test('GET /text-field', async () => {
    const options = {
      method: 'GET',
      url: '/text-field'
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    expect(response.headers['content-type']).to.include('text/html')

    const $ = cheerio.load(response.payload)

    // Title
    expect($('title').text()).to.equal('Full name')

    // Label / Heading
    expect($('label.govuk-label--xl').text().trim()).to.equal('Full name')

    // Hint
    expect($('span#fullName-hint.govuk-hint').text().trim()).to.equal('Some help please...')

    // Input
    expect($('input#fullName.govuk-input').length).to.equal(1)
  })

  lab.test('POST /text-field', async () => {
    const options = {
      method: 'POST',
      url: '/text-field',
      payload: {}
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    // expect(response.headers).to.include('location')
    // expect(response.headers.location).to.equal('/full-name')
  })
})
