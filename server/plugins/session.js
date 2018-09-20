module.exports = {
  plugin: require('yar'),
  options: {
    cookieOptions: {
      password: Array(32).fill(0).map(x => Math.random().toString(36).charAt(2)).join(''),
      isSecure: false,
      isHttpOnly: true
    }
  }
}
