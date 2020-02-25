const fs = require('fs')
const path = require('path')
const FormData = require('form-data')
const Wreck = require('@hapi/wreck')
const tmp = require('tmp')
const { documentUploadApiUrl } = require('./../config')

const parsedError = (key, error) => {
  return {
    path: key, href: `#${key}`, name: key, text: error
  }
}

class UploadService {
  get fileSizeLimit () {
    return 5e+6
  }

  get validFiletypes () {
    return ['jpg', 'jpeg', 'png', 'pdf']
  }

  saveFileToTmp (file) {
    if (!file) throw new Error('no file')
    let tmpDir = tmp.dirSync()
    let location = path.join(tmpDir.name, file.hapi.filename)
    return new Promise(resolve =>
      file
        .pipe(fs.createWriteStream(location))
        .on('finish', resolve(location)))
  }

  fileStreamsFromPayload (payload) {
    return Object.entries(payload).filter(([key, value]) => {
      return value && value._data
    })
  }

  async uploadDocument (location) {
    let form = new FormData()
    form.append('name', location.split('/').pop())
    form.append('file', fs.createReadStream(location))

    const data = { headers: form.getHeaders(), payload: form }

    try {
      const { res } = await Wreck.post(`${documentUploadApiUrl}/v1/files`, data)
      return this.parsedDocumentUploadResponse(res)
    } catch (e) {
      throw e
    }
  }

  parsedDocumentUploadResponse (res) {
    let error
    let location

    switch (res.statusCode) {
      case 201:
        location = res.headers.location
        break
      case 422:
        error = 'The selected file for "%s" contained a virus'
        break
      case 400:
      default:
        error = 'There was an error uploading your file'
    }

    return {
      location, error
    }
  }

  async failAction (request, h, err) {
    h.request.pre.filesizeError = true
    return h.continue
  }

  async handleUploadRequest (request, h) {
    const { cacheService } = request.services([])
    let files = []
    if (request.payload !== null) {
      files = this.fileStreamsFromPayload(request.payload)
    }
    let state = cacheService.getState(request)
    let originalFilenames = (state || {}).originalFilenames || {}

    for (let file of files) {
      let key = file[0]
      let fileValue = file[1]
      let fileSize = fileValue._data.length
      let previousUpload = originalFilenames[key]
      let isValidFiletype = true

      // TODO: Refactor this logic..
      if (fileSize > 1) {
        let extension = fileValue.hapi.filename.split('.').pop()
        if (!this.validFiletypes.includes(extension)) {
          h.request.payload[key] = fileValue.hapi.filename
          h.request.pre.errors = [...h.request.pre.errors || [],
            parsedError(key, `The selected file for "%s" must be a ${this.validFiletypes.slice(0, -1).join(', ')} or ${this.validFiletypes.slice(-1)}`)]
          isValidFiletype = false
        }
      }
      if (fileSize > 1 && isValidFiletype) {
        try {
          let saved = await this.saveFileToTmp(fileValue)
          let { error, location } = await this.uploadDocument(saved)
          if (location) {
            originalFilenames[key] = { originalFilename: fileValue.hapi.filename, location }
            h.request.payload[key] = location
          }
          if (error) {
            h.request.pre.errors = [...h.request.pre.errors || [], parsedError(key, error)]
          }
        } catch (e) {
          h.request.pre.errors = [...h.request.pre.errors || [], parsedError(key, e)]
        }
      } else if (previousUpload && file[1]._data.length < 1) {
        h.request.payload[key] = previousUpload.location
      } else {
        delete request.payload[key]
      }
    }
    await cacheService.mergeState(request, { originalFilenames })
    return h.continue
  }

  async downloadDocuments (paths) {
    return paths.map(path => {
      return Wreck.get(path)
    })
  }
}
module.exports = {
  UploadService
}
