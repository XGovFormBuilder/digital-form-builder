module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["<rootDir>/**/__tests__/*.(j|t)est.(ts|ts)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  coverageDirectory: "test-coverage",
  testPathIgnorePatterns: ["__tests__/helpers"],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 83,
      lines: 93,
      statements: 92,
    },
  },
};
