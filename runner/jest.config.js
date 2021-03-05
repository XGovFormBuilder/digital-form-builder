module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(jest|spec))\\.ts?$",
  moduleFileExtensions: ["ts", "js", "jsx", "json", "node"],
  coverageDirectory: "test-coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    src: "<rootDir>/src",
    server: "<rootDir>/src/server",
  },
  transformIgnorePatterns: ["<rootDir>/node_modules"],
};
