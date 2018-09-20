module.exports = {
  plugin: require('good'),
  options: {
    ops: {
      interval: 1000
    },
    reporters: {
      console: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [
            {
              log: '*',
              error: '*',
              response: '*',
              request: '*'
            }
          ]
        },
        {
          module: 'good-console'
        },
        'stdout'
      ]
    }
  }
}
