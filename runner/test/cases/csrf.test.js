const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const cheerio = require('cheerio')
const FormData = require('form-data')
const cookie = require('cookie')
const createServer = require('./../../server/index')
const { suite, before, test, after } = exports.lab = Lab.script()

suite('CSRF', () => {
  let server
  let csrfToken = ''
  let form = new FormData()
  form.append('licenceLength', 1)
  const options = () => {
    return {
      method: 'POST',
      url: '/basic/start',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
  }

  // Create server before each test
  before(async () => {
    server = await createServer({ data: 'basic.json', customPath: __dirname, enforceCsrf: true })
    await server.start()
  })

  after(async () => {
    await server.stop()
  })

  test('get request returns CSRF header', async () => {
    const options = {
      method: 'GET',
      url: '/basic/start'
    }

    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)
    let setCookieHeader = cookie.parse(response.headers['set-cookie'].find(header => header.includes('crumb')))
    expect(setCookieHeader).to.exist()
    csrfToken = setCookieHeader.crumb
    expect(csrfToken).to.not.be.empty()
    const $ = cheerio.load(response.payload)
    expect($('[name=crumb]').val()).to.equal(csrfToken)
  })

  test('post request without CSRF token returns 403 forbidden', { timeout: 10000 }, async () => {
    const response = await server.inject(options())
    expect(response.statusCode).to.equal(403)
  })

  test('post request with CSRF token returns 302 redirect', { timeout: 10000 }, async () => {
    form.append('crumb', csrfToken)
    let csrfOptions = options()
    csrfOptions.headers = { ...options.headers, ...{ cookie: `crumb=${csrfToken}`, 'x-CSRF-token': csrfToken, ...form.getHeaders() } }
    const response = await server.inject(csrfOptions)
    expect(response.statusCode).to.equal(302)
  })
})
