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

  async uploadConfiguration(id: string, configuration: string) {
    return Wreck.post(`${config.publishUrl}/publish`, {
      payload: JSON.stringify({ id, configuration }),
    });
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, JSON.parse(configuration).values);
  }

  async listAllConfigurations() {
    try {
      const { payload } = await Wreck.get(`${config.publishUrl}/published`);
      return JSON.parse(payload.toString());
    } catch (e) {
      console.log(
        "\x1b[36m%s\x1b[0m",
        `**********
ERROR: Publishing and previewing forms is not possible currently, either because the runner is
not available at ${config.publishUrl.toString()} or if it is running, previewMode may be set to false on it.

To enable publishing and previewing of forms, ensure the runner is running in development mode 
by setting NODE_ENV=development in your environment and then re-starting the runner with: 
$>yarn runner start

You can alternatively create a custom environment by placing a custom myenvironment.json file
in the runner/config folder. Note: enforceCsrf must be set to false 
and previewMode must be set to true on the runner for the designer to work
See runner/config/development.json for example dev defaults.
**********`
      );
    }
  }

  async getConfiguration(id: string) {
    const { payload } = await Wreck.get(`${config.publishUrl}/published/${id}`);
    return payload.toString();
  }
}
