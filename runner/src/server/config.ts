import { buildConfig } from "./utils/configSchema";
import { default as nodeConfig } from "config";

const config = buildConfig(nodeConfig);

export default config;
