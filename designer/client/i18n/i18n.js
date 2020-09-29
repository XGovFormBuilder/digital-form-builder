import React from 'react'
import i18n from 'i18next'
import Backend from 'i18next-http-backend'

const initI18n = (i18n) => {
  i18n
    .use(Backend)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      debug: true,
      interpolation: {
        escapeValue: false
      },
      backend: {
        loadPath: '/assets/translations/{{lng}}.{{ns}}.json'
      }
    })
}

function withI18n (Component) {
  return function WithI18n (props) {
    const translate = (text) => i18n.t(text)
    return <Component {...props} i18n={translate} />
  }
}

export {
  i18n,
  initI18n,
  withI18n
}
