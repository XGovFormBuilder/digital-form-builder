const path = require('path')
const Model = require('./model')
const fs = require('fs')
const { ordnanceSurveyKey } = require('../../config')
const { getState, mergeState, clearState } = require('../../db')
const configPath = path.join(__dirname, '..', '..')

const relativeTo = __dirname
const defaultPageController = './pages'

const configFiles = fs.readdirSync(configPath).filter(filename => {
  if (filename.indexOf(`.json`) >= 0) {
    return filename
  }
})

const configurePlugins = (configFile, customPath) => {
  const dataFilePath = path.join(customPath || configPath, configFile)
  const data = require(dataFilePath)
  // probably want to have basePath configurable in json also/instead
  const basePath = configFile.replace(/govsite\.|\.json|/gi, '')
  const model = new Model(data, {
    getState,
    mergeState,
    clearState,
    relativeTo,
    defaultPageController
  })

  return [{
    plugin: require('digital-form-builder-engine'),
    options: { model, ordnanceSurveyKey, basePath }
  }, {
    plugin: require('digital-form-builder-designer'),
    options: { path: dataFilePath, basePath, playgroundMode: true }
  }]
}
module.exports = {
  routes: () => [].concat(...configFiles.map(configFile => configurePlugins(configFile))),
  configurePlugins
}
