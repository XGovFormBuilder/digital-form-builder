const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const Wreck = require('@hapi/wreck')
const tmp = require('tmp')
const { documentUploadApiUrl } = require('./../config')

const saveFileToTmp = (file) => {
  if (!file) throw new Error('no file')
  let tmpDir = tmp.dirSync()
  let location = path.join(tmpDir.name, file.hapi.filename)
  return new Promise(resolve =>
    file
      .pipe(fs.createWriteStream(location))
      .on('finish', resolve(location)))
}

const fileStreamsFromPayload = (payload) => {
  return Object.entries(payload).filter(([key, value]) => {
    return value && value._data
  })
}

const uploadDocument = async (location) => {
  let form = new FormData()
  form.append('name', location.split('/').pop())
  form.append('file', fs.createReadStream(location))

  const data = { headers: form.getHeaders(), payload: form }

  try {
    const { res } = await Wreck.post(`${documentUploadApiUrl}/v1/files`, data)
    return parsedDocumentUploadResponse(res)
  } catch (e) {
    throw e
  }
}

const parsedDocumentUploadResponse = (res) => {
  let error = ''
  let location = ''

  switch (res.statusCode) {
    case 201:
      location = res.headers.location
      break
    case 422:
      error = 'The file you uploaded contained a virus'
      break
    case 400:
    default:
      error = 'There was an error uploading your file'
  }

  return {
    location, error
  }
}

module.exports = {
  uploadDocument, fileStreamsFromPayload, saveFileToTmp
}
