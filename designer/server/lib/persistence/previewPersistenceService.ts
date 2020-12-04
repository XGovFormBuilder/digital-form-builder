import type { PersistenceService } from "./persistenceService";
import Wreck from "@hapi/wreck";
import config from "../../config";

/**
 * Persistence service that relies on the runner for storing
 * the form configurations in memory.
 * This should likely never be used in production but is a handy
 * development utility.
 */
export class PreviewPersistenceService implements PersistenceService {
  logger: any;

  async uploadConfiguration(_id: string, _configuration: string) {
    return Promise.resolve("OK");
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, JSON.parse(configuration).values);
  }

  async listAllConfigurations() {
    const { payload } = await Wreck.get(`${config.previewUrl}/published`);
    return JSON.parse(payload.toString());
  }

  async getConfiguration(id: string) {
    const { payload } = await Wreck.get(`${config.previewUrl}/published/${id}`);
    return payload.toString();
  }
}
