function proceed (request, h, nextUrl, force) {
  let url = nextUrl

  const returnUrl = request.query.returnUrl
  if (returnUrl && returnUrl.startsWith('/')) {
    if (force) {
      const hasQuery = ~url.indexOf('?')
      url += (hasQuery ? '&' : '?') + 'returnUrl=' + returnUrl
    } else {
      url = returnUrl
    }
  }

  return h.redirect(url)
}

module.exports = { proceed }
