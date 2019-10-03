const path = require('path')
const Model = require('./model')
const fs = require('fs')
const { ordnanceSurveyKey } = require('../../config')
const { getState, mergeState } = require('../../db')
const configPath = path.join(__dirname, '..', '..')

const relativeTo = __dirname
const defaultPageController = './pages'

const configFiles = fs.readdirSync(configPath).filter(filename => {
  if (filename.indexOf(`.json`) >= 0) {
    console.log(filename)
    return filename
  }
})

const configurePlugins = (configFile) => {
  const dataFilePath = path.join(configPath, configFile)
  const data = require(dataFilePath)
  // probably want to have basePath configurable in json also/instead
  const basePath = configFile.replace(/govsite\.|\.json|/gi, '')
  const model = new Model(data, {
    getState,
    mergeState,
    relativeTo,
    defaultPageController
  })

  return [{
    plugin: require('digital-form-builder-engine'),
    options: { model, ordnanceSurveyKey, basePath }
  }]
}
module.exports = [].concat(...configFiles.map(configFile => configurePlugins(configFile)))
