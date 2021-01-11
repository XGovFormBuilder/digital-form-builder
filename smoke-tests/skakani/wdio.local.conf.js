const { config } = require('./wdio.shared.conf')

exports.config = {
    ...config,
    ...{
        capabilities: [{
            browserName: 'chrome',
            'goog:chromeOptions': {
                headless: true
            }
        }]
    }
}
