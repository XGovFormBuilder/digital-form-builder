const path = require('path')
const Model = require('./../../server/plugins/builder/model')
const fs = require('fs')
const { getState, mergeState } = require('../db')
const configPath = path.join(__dirname, '..', 'cases')
const relativeTo = __dirname
const defaultPageController = './../../server/plugins/builder/pages'

const configFiles = fs.readdirSync(configPath).filter(filename => {
  if (filename.indexOf(`.json`) >= 0) {
    return filename
  }
})

const configurePlugins = (configFile) => {
  const dataFilePath = path.join(configPath, configFile)
  const data = require(dataFilePath)
  // probably want to have basePath configurable in json also/instead
  const basePath = configFile.replace(/govsite\.|\.json|/gi, '')
  return configurePlugin(data, basePath)
}

const configurePlugin = (data, basePath) => {
  const model = new Model(data, {
    getState,
    mergeState,
    relativeTo,
    defaultPageController
  })

  return [{
    plugin: require('digital-form-builder-engine'),
    options: { model, basePath }
  }]
}

const routes = () => {
  return [].concat(...configFiles.map(configFile => configurePlugins(configFile)))
}

module.exports = {
  routes,
  configurePlugin
}
