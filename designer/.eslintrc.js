module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["plugin:react/recommended", "plugin:react-hooks/recommended"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks"],
  rules: {
    "react/prop-types": 0,
    "react-hooks/rules-of-hooks": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
