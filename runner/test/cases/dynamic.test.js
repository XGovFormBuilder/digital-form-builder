import { CacheService } from '../../src/server/lib/cacheService'
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const cheerio = require('cheerio')
const FormData = require('form-data')
const createServer = require('../../src/server/index')
const { before, afterEach, test, suite, after } = exports.lab = Lab.script()
const { stub, restore } = require('sinon')

const state = {
  progress: [
    '/test/start',
    '/dynamic/uk-passport',
    '/dynamic/how-many-people',
    '/dynamic/applicant-repeatable?num=1',
    '/dynamic/contact-details?num=1',
    '/dynamic/applicant-repeatable?num=2',
    '/dynamic/contact-details?num=2'
  ],
  checkBeforeYouStart: {
    ukPassport: true
  },
  applicantDetails: {
    numberOfApplicants: 2
  },
  applicant: [
    {
      '/applicant-repeatable': {
        firstName: 'a',
        middleName: 'b',
        lastName: 'c'
      },
      '/contact-details': {
        phoneNumber: '123',
        emailAddress: 'test@one'
      }
    },
    {
      '/applicant-repeatable': {
        firstName: 'c',
        middleName: 'd',
        lastName: 'e'
      },
      '/contact-details': {
        phoneNumber: '456',
        emailAddress: 'test@two'
      }
    }
  ]
}

const postOptions = (path, form) => {
  const formData = new FormData()

  Object.entries(form).forEach(([key, value]) => {
    formData.append(key, value)
  })

  return {
    method: 'POST',
    url: path,
    headers: formData.getHeaders(),
    payload: formData.getBuffer()
  }
}

const FORMS = {
  passport: { ukPassport: 'true' },
  howManyPeople: { numberOfApplicants: 2 },
  name: {
    firstName: 'a',
    middleName: 'b',
    lastName: 'c'
  },
  contact: {
    phoneNumber: '123',
    emailAddress: 'test@test'
  }
}

suite('Dynamic pages', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await createServer({ data: 'dynamic.json', customPath: __dirname })
    await server.start()
  })

  after(async () => {
    server.stop()
  })

  afterEach(async () => {
    restore()
    const { cacheService } = server.services()
    await cacheService.clearState({ yar: { id: 'TEST_ID' } })
    stub(CacheService.prototype, 'Key').callsFake(() => ({
      segment: 'segment',
      id: 'TEST_ID'
    }))
  })

  test('Start of repeatable section appends num parameter', async () => {
    const response = await server.inject(postOptions('/dynamic/how-many-people', { numberOfApplicants: 2 }))
    expect(response.headers.location).to.equal('/dynamic/applicant-repeatable?num=1')
  })

  test('Asks questions in section correct number of times', async () => {
    let nextPath = '/dynamic/uk-passport'
    let response

    const reassignNextPath = () => { nextPath = response.headers.location }

    response = await server.inject(postOptions(nextPath, FORMS.passport))
    reassignNextPath()
    response = await server.inject(postOptions(nextPath, FORMS.howManyPeople))
    reassignNextPath()
    response = await server.inject(postOptions(nextPath, FORMS.name))
    reassignNextPath()

    response = await server.inject(postOptions(nextPath, FORMS.contact))
    expect(response.headers.location).to.equal('/dynamic/applicant-repeatable?num=2')
    reassignNextPath()

    response = await server.inject(postOptions(nextPath, FORMS.name))
    reassignNextPath()

    response = await server.inject(postOptions(nextPath, FORMS.contact))
    expect(response.headers.location).to.equal('/dynamic/summary')

    reassignNextPath()
  })

  test('Change url redirects to question page with correct answers', async () => {
    stub(CacheService.prototype, 'getState').callsFake(() => {
      return state
    })

    const response = await server.inject({
      method: 'GET',
      url: '/dynamic/summary'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.headers['content-type']).to.include('text/html')

    let $ = cheerio.load(response.payload)

    const changeEmailLink = $('span:contains("Your email address")')[0].parent.attribs.href
    const changeEmailPage = await server.inject({
      method: 'GET',
      url: changeEmailLink
    })
    $ = cheerio.load(changeEmailPage.payload)
    expect($('#emailAddress')[0].attribs.value).to.equal(state.applicant[0]['/contact-details'].emailAddress)
  })

  test('Summary page displays correct number of repeatable sections', async () => {
    const { cacheService } = server.services()
    await cacheService.mergeState({ yar: { id: 'TEST_ID' } }, state)
    const response = await server.inject({
      method: 'GET',
      url: '/dynamic/summary'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.headers['content-type']).to.include('text/html')

    let $ = cheerio.load(response.payload)
    const applicantHeadings = $('h2:contains("Applicant")')
    expect(applicantHeadings).to.be.length(2)

    await server.inject(postOptions('/dynamic/how-many-people', { numberOfApplicants: 1 }))

    const responseAfterNumberChange = await server.inject({
      method: 'GET',
      url: '/dynamic/summary'
    })

    $ = cheerio.load(responseAfterNumberChange.payload)

    expect($('h2:contains("Applicant")')).to.be.length(1)
  })
})
