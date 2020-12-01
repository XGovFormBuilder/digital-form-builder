import * as React from "react";
import i18n from "i18next";
import Backend from "i18next-http-backend";

const initI18n = (i18next: typeof i18n): void => {
  i18next.use(Backend).init({
    lng: "en",
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/assets/translations/{{lng}}.{{ns}}.json",
    },
  });
};

const translate = (text: string, options?: any): string =>
  i18n.t(text, options);

interface WithI18nProps {
  i18n: (text: string, options?: any) => string;
}

const withI18n = <P extends WithI18nProps>(
  Component: React.ComponentType<P>
) => {
  return function WithI18n(props: P) {
    return <Component {...props} i18n={translate} />;
  };
};

const withI18nRef = (WrappedComponent) => {
  function WithI18n({ forwardedRef, ...rest }) {
    return <WrappedComponent {...rest} i18n={translate} ref={forwardedRef} />;
  }

  const forwardRef = (props, ref) =>
    React.createElement(
      WithI18n,
      Object.assign({}, props, { forwardedRef: ref })
    );
  return React.forwardRef(forwardRef);
};

export { i18n, initI18n, withI18n, withI18nRef };
