import type { PersistenceService } from "./persistenceService";
import Wreck from "@hapi/wreck";
import config from "../../config";

export class ApiPersistenceService implements PersistenceService {
  logger: any;

  async uploadConfiguration(id: string, configuration: string) {
    console.log(configuration);
    return Wreck.post(`${config.formsApiUrl}/publish`, {
      payload: JSON.stringify({ id, configuration: JSON.parse(configuration) }),
    });
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, configuration);
  }

  async listAllConfigurations() {
    const { payload } = await Wreck.get(`${config.formsApiUrl}/published`);
    return JSON.parse(payload.toString());
  }

  async getConfiguration(id: string) {
    console.log("Getting: ", id);
    const { payload } = await Wreck.get(
      `${config.formsApiUrl}/published/${id}`
    );
    var configuration = JSON.parse(payload.toString()).values;
    return JSON.stringify(configuration);
  }
}
