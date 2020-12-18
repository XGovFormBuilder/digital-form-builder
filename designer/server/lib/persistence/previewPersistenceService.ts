import type { PersistenceService } from "./persistenceService";
import Wreck from "@hapi/wreck";
import config from "../../config";
import { FormConfiguration } from "./types";

/**
 * Persistence service that relies on the runner for storing
 * the form configurations in memory.
 * This should likely never be used in production but is a handy
 * development utility.
 */
export class PreviewPersistenceService implements PersistenceService {
  logger: any;

  async uploadConfiguration(id: string, configuration: string): Promise<any> {
    return Wreck.post(`${config.previewUrl}/publish`, {
      payload: JSON.stringify({ id, configuration }),
    });
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, JSON.parse(configuration).values);
  }

  async listAllConfigurations() {
    const { payload } = await Wreck.get<FormConfiguration[]>(
      `${config.previewUrl}/published`
    );
    return JSON.parse(payload.toString());
  }

  async getConfiguration(id: string) {
    const { payload } = await Wreck.get<FormConfiguration>(
      `${config.previewUrl}/published/${id}`
    );
    return payload.toString();
  }
}
