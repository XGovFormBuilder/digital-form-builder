import { i18n } from "../client/i18n";
import enCommonTranslations from "../client/i18n/translations/en.translation.json";

const i18nSettings = {
  lng: "en",
  ns: ["common"],
  defaultNS: "common",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      common: enCommonTranslations,
    },
  },
};

const initI18n = function () {
  i18n.init(i18nSettings);
};

export default initI18n;
