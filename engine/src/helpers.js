function proceed (request, h, nextUrl) {
  let url
  const returnUrl = request.query.returnUrl
  if (returnUrl && returnUrl.startsWith('/')) {
    url = returnUrl
  } else {
    url = `${nextUrl}${request.url.search ?? ''}`
  }
  return h.redirect(url)
}

module.exports = { proceed }
