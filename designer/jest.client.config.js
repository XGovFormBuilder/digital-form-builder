module.exports = {
  roots: ["<rootDir>/client"],
  displayName: "client",
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
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
};
