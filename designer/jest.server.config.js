module.exports = {
  roots: ["<rootDir>/server"],
  displayName: "server",
  setupFilesAfterEnv: ["<rootDir>/jest-server-setup.js"],
  testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/"],
  coverageDirectory: "test-coverage/server/jest",
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 48,
      lines: 56,
      statements: 55,
    },
  },
};
