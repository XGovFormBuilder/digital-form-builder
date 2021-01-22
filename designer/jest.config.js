module.exports = {
  roots: ["<rootDir>/client", "<rootDir>/server"],
  testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
  },
};
