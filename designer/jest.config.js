module.exports = {
  projects: [
    {
      roots: ["<rootDir>/client"],
      displayName: "client",
      setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
      testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
      testPathIgnorePatterns: ["<rootDir>/test/"],
      moduleNameMapper: {
        "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js",
      },
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    {
      displayName: "server",
      roots: ["<rootDir>/server"],
      setupFilesAfterEnv: ["<rootDir>/jest-server-setup.js"],
      testMatch: ["<rootDir>/**/__tests__/*.jest.(ts|tsx)"],
      testPathIgnorePatterns: ["<rootDir>/test/"],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  ],
};
