const createServer = require('../create-server')
const data = require('./components.json')
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const fs = require('fs')

const opts = {
  chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
  onlyCategories: ['accessibility']
}

createServer({ data, basePath: 'components' })
  .then(server => server.start())
  .then(() => {
    launchChromeAndRunLighthouse('http://localhost:3009/components/all-components', { ...opts, output: 'json' }).then(() => {
      launchChromeAndRunLighthouse('http://localhost:3009/components/all-components', { ...opts, output: 'html' }).then(() => {
        process.exit(0)
      })
    })
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })

function launchChromeAndRunLighthouse (url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    opts.port = chrome.port
    return lighthouse(url, opts, config).then(results => {
      fs.writeFileSync(`./report.${opts.output}`, results.report)
      return chrome.kill().then(() => results.lhr)
    })
  })
}
