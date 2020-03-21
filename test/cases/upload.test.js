const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const cheerio = require('cheerio')
const FormData = require('form-data')
const createServer = require('./../../server/index')
const { before, test, suite, after } = exports.lab = Lab.script()
const { UploadService } = require('./../../server/lib/documentUpload')
const { stub, restore } = require('sinon')
const fs = require('fs')
const path = require('path')

suite('uploads', () => {
  let server

  // Create server before each test
  before(async () => {
    server = await createServer({ data: 'upload.json', customPath: __dirname })
    await server.start()
  })

  after(async () => {
    await server.stop()
  })

  test('request with file upload field populated is successful and redirects to next page', async () => {
    let form = new FormData()
    form.append('fullName', 1)
    form.append('file1', Buffer.from('an image..'))
    // form.append('file2', Buffer.from([]))
    const options = {
      method: 'POST',
      url: '/upload/upload-file',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)
    expect(response.statusCode).to.equal(302)
    expect(response.headers).to.include('location')
    expect(response.headers.location).to.equal('/upload/summary')
  })

  test('request with file upload field missing returns with error message', async () => {
    let form = new FormData()
    form.append('fullName', 1)
    form.append('file1', Buffer.from([]))
    const options = {
      method: 'POST',
      url: '/upload/upload-file',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)
    expect(response.statusCode).to.equal(200)

    const $ = cheerio.load(response.payload)
    expect($(`[href='#file1']`).text().trim()).to.equal(`Passport photo is required`)
  })

  test('request with file upload field containing virus returns with error message', async () => {
    restore()
    stub(UploadService.prototype, 'fileStreamsFromPayload').callsFake(() => {
      return [['file1', { hapi: { filename: 'file.jpg' }, _data: fs.readFileSync(path.join(__dirname, 'dummy.pdf')) }]]
    })
    stub(UploadService.prototype, 'uploadDocuments').callsFake(async () => {
      return {
        error: 'The selected file for "%s" contained a virus'
      }
    })
    stub(UploadService.prototype, 'saveFileToTmp').callsFake(async () => {
      return '/tmp/dir/file'
    })

    let form = new FormData()
    form.append('fullName', 1)
    form.append('file1', fs.readFileSync(path.join(__dirname, 'dummy.pdf')))
    const options = {
      method: 'POST',
      url: '/upload/upload-file',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)

    const $ = cheerio.load(response.payload)
    expect($(`[href='#file1']`).text().trim()).to.equal(`The selected file for "Passport photo" contained a virus`)
  })
  test('request with files larger than 2MB return an error', async () => {
    restore()
    stub(UploadService.prototype, 'fileStreamsFromPayload').callsFake(() => {
      return [['file1', { hapi: { filename: 'file.jpg' }, _data: fs.readFileSync(path.join(__dirname, 'dummy.pdf')) }]]
    })
    stub(UploadService.prototype, 'fileSizeLimit').get(() => {
      return 500
    })

    let form = new FormData()
    form.append('fullName', 1)
    form.append('file1', fs.readFileSync(path.join(__dirname, 'dummy.pdf')))
    const options = {
      method: 'POST',
      url: '/upload/upload-file',
      headers: form.getHeaders(),
      payload: null
    }
    const response = await server.inject(options)

    const $ = cheerio.load(response.payload)
    expect($(`[href='#file1']`).text().trim()).to.equal('The file you uploaded was too big')
  })

  test('request with file upload field containing invalid file type returns with error message', async () => {
    restore()
    stub(UploadService.prototype, 'fileStreamsFromPayload').callsFake(() => {
      return [['file1', { hapi: { filename: 'file.test' }, _data: fs.readFileSync(path.join(__dirname, 'dummy.pdf')) }]]
    })

    let form = new FormData()
    form.append('fullName', 1)
    form.append('file1', fs.readFileSync(path.join(__dirname, 'dummy.pdf')))
    const options = {
      method: 'POST',
      url: '/upload/upload-file',
      headers: form.getHeaders(),
      payload: form.getBuffer()
    }
    const response = await server.inject(options)

    const $ = cheerio.load(response.payload)
    expect($(`[href='#file1']`).text().trim()).to.contain(`The selected file for "Passport photo" must be a jpg, jpeg, png or pdf`)
  })
})
