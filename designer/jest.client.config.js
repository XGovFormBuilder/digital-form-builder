module.exports = {
  roots: ["<rootDir>/client"],
  displayName: "client",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "govuk/assets/images/govuk-logotype-crown.png":
      "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/favicon.ico": "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/govuk-mask-icon.svg":
      "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/govuk-apple-touch-icon-180x180":
      "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/govuk-apple-touch-icon-167x167":
      "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/govuk-apple-touch-icon-152x152":
      "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/govuk-apple-touch-icon":
      "<rootDir>/__mocks__/imageMock.js",
    "govuk/assets/images/govuk-opengraph-image":
      "<rootDir>/__mocks__/imageMock.js",
  },
  coverageDirectory: "test-coverage/client/jest",
  coverageThreshold: {
    global: {
      branches: 39,
      functions: 35,
      lines: 40,
      statements: 40,
    },
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!@xgovformbuilder/govuk-react-jsx/.*)",
  ],
};
