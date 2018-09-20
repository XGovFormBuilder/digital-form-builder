const Lab = require('lab')
const { expect } = require('code')
const cheerio = require('cheerio')
// const HtmlHelper = require('../html-helper')
const createServer = require('../create-server')
const lab = exports.lab = Lab.script()
const data = require('./basic.json')

lab.experiment('Basic', () => {
  let server

  // Create server before each test
  lab.before(async () => {
    server = await createServer(data)
  })

  lab.test('GET /', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    expect(response.headers['content-type']).to.include('text/html')

    const $ = cheerio.load(response.payload)
    // const helper = new HtmlHelper($)

    // const page = data.pages[0]
    // helper.assertTitle(page)

    expect($('title').text()).to.equal('Intro page')
    expect($('h1.govuk-heading-xl').text().trim()).to.equal('Intro page')
    expect($('p.govuk-body').length).to.equal(1)
    expect($('p.govuk-body').text().trim()).to.equal('Test content')
  })

  lab.test('POST /', async () => {
    const options = {
      method: 'POST',
      url: '/',
      payload: {}
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(302)
    expect(response.headers).to.include('location')
    expect(response.headers.location).to.equal('/full-name')
  })
})
