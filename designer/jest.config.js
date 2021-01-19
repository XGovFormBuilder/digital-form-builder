module.exports = {
  roots: ["<rootDir>/client"],
  testMatch: ["<rootDir>/client/**/__tests__/*.(jest|test).(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
  moduleNameMapper: {
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
  },
};
