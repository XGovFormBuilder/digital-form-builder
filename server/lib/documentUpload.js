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
      if (value) {
        if (Array.isArray(value)) {
          return value.every(nv => !!nv._data)
        }
        return !!value._data
      }
      return false
    })
  }

  async uploadDocument (location) {
    let form = new FormData()
    form.append('name', location.split('/').pop())
    form.append('files', fs.createReadStream(location))

    const data = { headers: form.getHeaders(), payload: form }

    try {
      const { res } = await Wreck.post(`${documentUploadApiUrl}/v1/files`, data)
      return this.parsedDocumentUploadResponse(res)
    } catch (e) {
      throw e
    }
  }

  async uploadDocuments (locations) {
    let form = new FormData()
    for (let location of locations) {
      form.append('files', fs.createReadStream(location))
    }

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

    // files is an array of tuples containing key and value.
    // value may be an array of file data where multiple files have been uploaded
    for (let file of files) {
      let key = file[0]
      let values
      if (Array.isArray(file[1])) {
        values = file[1]
      } else {
        values = [file[1]]
      }

      let previousUpload = originalFilenames[key]

      const locations = (await Promise.all(values.map(async (fileValue) => {
        let fileSize = fileValue._data.length
        if (fileSize > 1) {
          let extension = fileValue.hapi.filename.split('.').pop()
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
        }
        return null
      }))).filter(value => !!value)

      if (locations && locations.length) {
        try {
          let { error, location } = await this.uploadDocuments(locations)
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
        request.payload[key] = previousUpload.location
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
