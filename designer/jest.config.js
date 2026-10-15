// This root config exists only so `jest:watch`, bare `npx jest` and IDE Jest
// plugins can discover and run both projects. It must not define any settings itself —
// each project's real settings (moduleNameMapper, coverage thresholds, etc.)
// live in jest.client.config.js and jest.server.config.js, which are also
// what the "jest:client" and "jest:server" scripts run directly.
module.exports = {
  projects: [
    "<rootDir>/jest.client.config.js",
    "<rootDir>/jest.server.config.js",
  ],
};
