import { buildConfig } from "./utils/configSchema";
const nodeConfig = require("config");

const config = buildConfig(nodeConfig);

export default config;
