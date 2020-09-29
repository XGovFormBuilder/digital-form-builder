// @flow
import * as React from 'react'
import i18n from 'i18next'
import Backend from 'i18next-http-backend'

const initI18n = (i18next: i18n): void => {
  i18next
    .use(Backend)
    .init({
      lng: 'cy',
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

const translate = (text: string): string => i18n.t(text)

function withI18n<Props> (
  Component: React.AbstractComponent<{| ...Props, i18n: (text: string) => string |}>
): React.AbstractComponent<Props> {
  return function WithI18n (props) {
    return <Component {...props} i18n={translate} />
  }
}

export {
  i18n,
  initI18n,
  withI18n
}
