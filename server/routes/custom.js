module.exports = {
  method: 'GET',
  path: '/custom',
  options: {
    handler: (request, h) => {
      // const { page } = request.route.settings.plugins['govuk-site-engine']
      return h.view('home')
    }
  }
}
