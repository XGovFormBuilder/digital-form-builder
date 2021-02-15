module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:json/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "i18n-json"],
  rules: {
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "warn",
    "i18n-json/sorted-keys": 2,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
