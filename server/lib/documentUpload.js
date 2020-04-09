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
    const tmpDir = tmp.dirSync()
    const location = path.join(tmpDir.name, file.hapi.filename)
    return new Promise(resolve =>
      file
        .pipe(fs.createWriteStream(location))
        .on('finish', resolve(location)))
  }

  fileStreamsFromPayload (payload) {
    return Object.entries(payload).filter(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          return value.every(nv => !!nv._data && nv._data.length > 1)
        }
        return !!value._data && value._data.length > 1
      }
      return false
    })
  }

  async uploadDocuments (locations) {
    const form = new FormData()
    for (const location of locations) {
      form.append('files', fs.createReadStream(location))
    }

    const data = { headers: form.getHeaders(), payload: form }
    const { res } = await Wreck.post(`${documentUploadApiUrl}/v1/files`, data)
    return this.parsedDocumentUploadResponse(res)
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
        error = 'Invalid file type. Upload a PNG, JPG or PDF'
        break
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
    const state = cacheService.getState(request)
    const originalFilenames = (state || {}).originalFilenames || {}

    let files = []
    if (request.payload !== null) {
      files = this.fileStreamsFromPayload(request.payload)
    }

    // files is an array of tuples containing key and value.
    // value may be an array of file data where multiple files have been uploaded
    for (const file of files) {
      const key = file[0]
      const previousUpload = originalFilenames[key] || {}

      let values
      if (Array.isArray(file[1])) {
        values = file[1]
      } else {
        values = [file[1]]
      }

      const locations = (await Promise.all(values.map(async (fileValue) => {
        const extension = fileValue.hapi.filename.split('.').pop()
        if (!this.validFiletypes.includes(extension)) {
          request.pre.errors = [...h.request.pre.errors || [],
            parsedError(key, `The selected file for "%s" must be a ${this.validFiletypes.slice(0, -1).join(', ')} or ${this.validFiletypes.slice(-1)}`)]
          return fileValue.hapi.filename
        }
        try {
          return await this.saveFileToTmp(fileValue)
        } catch (e) {
          request.pre.errors = [...h.request.pre.errors || [], parsedError(key, e)]
        }
      }))).filter(value => !!value)

      if (locations.length === values.length) {
        try {
          const { error, location } = await this.uploadDocuments(locations)
          if (location) {
            originalFilenames[key] = [...originalFilenames[key] || [], { location }]
            request.payload[key] = location
          }
          if (error) {
            request.pre.errors = [...h.request.pre.errors || [], parsedError(key, error)]
          }
        } catch (e) {
          request.pre.errors = [...h.request.pre.errors || [], parsedError(key, e)]
        }
      } else {
        request.payload[key] = previousUpload.location || ''
      }

      if (request.pre.errors && request.pre.errors.length) {
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
