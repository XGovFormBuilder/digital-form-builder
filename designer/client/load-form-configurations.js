function fetchConfigurations () {
  return window.fetch('/configurations', {
    method: 'get',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.ok) {
      return res.json()
    } else {
      throw res.error
    }
  })
}

async function loadConfigurations () {
  return fetchConfigurations().then(data => {
    return Object.values(data) || []
  }).catch(error => {
    console.log(error)
    return []
  })
}

export default {
  loadConfigurations: loadConfigurations
}
