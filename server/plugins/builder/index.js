const path = require('path')
const config = require('../../config')
const { getState, mergeState } = require('../../db')
const dataFilePath = path.join(__dirname, '../../govsite.example.json')
const data = require(dataFilePath)
const relativeTo = __dirname
const defaultPageController = './pages'
const Model = require('./model')

const model = new Model(data, {
  getState,
  mergeState,
  relativeTo,
  defaultPageController
})

module.exports = [{
  plugin: require('digital-form-builder-engine'),
  options: { model, ordnanceSurveyKey: config.ordnanceSurveyKey }
}, {
  plugin: require('digital-form-builder-designer'),
  options: { path: dataFilePath }
}]
