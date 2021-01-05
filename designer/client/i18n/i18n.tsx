import * as React from "react";
import i18next from "i18next";
import Backend from "i18next-http-backend";
import enCommonTranslations from "./translations/en.translation.json";

const DEFAULT_SETTINGS = {
  lng: "en",
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: enCommonTranslations,
    },
  },
  backend: {
    loadPath: "/assets/translations/{{lng}}.{{ns}}.json",
  },
};

export const initI18n = (
  i18n: typeof i18next = i18next,
  settings = DEFAULT_SETTINGS
): void => {
  i18n.use(Backend).init(settings);
};

export type I18n = (text: string, options?: any) => string;

export const i18n: I18n = (text, options) => i18next.t(text, options);

export interface WithI18nProps {
  i18n: I18n;
}

export const withI18n = <P extends WithI18nProps>(
  Component: React.ComponentType<P>
) => {
  return function WithI18n(props: Omit<P, keyof WithI18nProps>) {
    return <Component {...(props as P)} i18n={i18n} />;
  };
};

export const withI18nRef = (WrappedComponent) => {
  function WithI18n({ forwardedRef, ...rest }) {
    return <WrappedComponent {...rest} i18n={i18n} ref={forwardedRef} />;
  }

  const forwardRef = (props, ref) =>
    React.createElement(
      WithI18n,
      Object.assign({}, props, { forwardedRef: ref })
    );
  return React.forwardRef(forwardRef);
};
