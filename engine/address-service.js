const util = require('./util')

async function findByPostcode (key, postcode) {
  const findByPostcodeUrl = `https://api.ordnancesurvey.co.uk/places/v1/addresses/postcode?lr=EN&fq=logical_status_code:1&dataset=DPA&postcode=${postcode}&key=${key}`

  const payload = await util.getJson(findByPostcodeUrl)

  if (!payload || !payload.results || !payload.results.length) {
    return []
  }

  const results = payload.results.map(item => item.DPA)

  let addresses = results

  return addresses
    .map(item => {
      return {
        uprn: item.UPRN,
        postcode: item.POSTCODE,
        address: item.ADDRESS,
        item: item
      }
    })
}

module.exports = findByPostcode
