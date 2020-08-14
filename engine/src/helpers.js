import { RelativeUrl } from 'digital-form-builder-model'

const paramsToCopy = [RelativeUrl.FEEDBACK_RETURN_INFO_PARAMETER]

function proceed (request, h, nextUrl) {
  let url
  const returnUrl = request.query.returnUrl
  if (returnUrl && returnUrl.startsWith('/')) {
    url = returnUrl
  } else {
    console.log(`Processing url ${nextUrl}`)
    const relativeUrl = new RelativeUrl(nextUrl)
    paramsToCopy.forEach(key => {
      const value = request.query[key]
      if (value) {
        relativeUrl.addParamIfNotPresent(key, value)
      }
    })
    url = relativeUrl.toString()
  }

  return h.redirect(url)
}

module.exports = { proceed }
