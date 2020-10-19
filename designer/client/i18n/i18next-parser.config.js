/**
  This is the configuration for i18next-parser which is a tool used to facilitate the maintenance of the translation catalogs.
  Please run "yarn designer i18n-parse" to create/update translations files inside client/i18n/translations.
  i18next is configured to request the specific translation file file asynchronously once the application loads, it will execute a request to "/assets/translations/{{en|cy}}.translation.json"
  During the build the "client/i18n/translations" folder is copied to dist/client/assets/translations to make them available to the server's assets route.
 */
module.exports = {
  // en: English, cy: Welsh
  locales: ["en", "cy"],
  output: "client/i18n/translations/$LOCALE.$NAMESPACE.json",
  lexers: {
    js: ["JsxLexer"],
  },
  createOldCatalogs: true,
  useKeysAsDefaultValue: true,
};
