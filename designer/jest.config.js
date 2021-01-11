module.exports = {
  roots: ["<rootDir>/client"],
  testMatch: ["<rootDir>/client/conditions/__tests__/*.jest.(ts|tsx)"],
  testPathIgnorePatterns: ["<rootDir>/test/"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.js"],
};
