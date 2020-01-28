const path = require('path')
const fs = require('fs')
const { getState, mergeState, clearState } = require('../../db')
const configPath = path.join(__dirname, '..', '..')
const config = require('./../../config')

const relativeTo = __dirname
const defaultPageController = './pages'

const configFiles = fs.readdirSync(configPath).filter(filename => {
  if (filename.indexOf(`.json`) >= 0) {
    return filename
  }
})

const idFromFilename = (filename) => {
  return filename.replace(/govsite\.|\.json|/gi, '')
}

const configurePlugins = (configFile, customPath) => {
  let configs
  if (configFile && customPath) {
    configs = [{ configuration: require(path.join(customPath, configFile)), id: idFromFilename(configFile) }]
  } else {
    configs = configFiles.map(configFile => {
      const dataFilePath = path.join(configPath, configFile)
      const configuration = require(dataFilePath)
      // probably want to have basePath configurable in json also/instead
      const id = idFromFilename(configFile)
      return { configuration, id }
    })
  }
  let modelOptions = {
    getState,
    mergeState,
    clearState,
    relativeTo,
    defaultPageController,
    previewMode: config.previewMode
  }

  return {
    plugin: require('digital-form-builder-engine'),
    options: { modelOptions, configs, previewMode: config.previewMode }
  }
}
module.exports = {
  configurePlugins
}
