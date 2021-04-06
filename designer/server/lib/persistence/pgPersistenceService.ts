import { PersistenceService } from "./persistenceService";
import { FormConfiguration, Logger } from "@xgovformbuilder/model";
import { getCustomRepository } from "typeorm";
import { Form, FormRepository } from "../../repositories";
import { initDB } from "../../db";

export class PGPersistenceService implements PersistenceService {
  logger: any;
  bucket: any;

  constructor(server: any) {
    this.logger = new Logger(server, "PGPersistenceService");
    initDB();
  }

  async listAllConfigurations() {
    try {
      const data = await getCustomRepository(
        FormRepository,
        "designerCon"
      ).find();

      return data.map((entry) => {
        return new FormConfiguration(
          entry.id,
          entry.name,
          entry.modifiedAt.toISOString(),
          entry.feedbackForm
        );
      });
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async getConfiguration(id: string) {
    try {
      const data = await getCustomRepository(
        FormRepository,
        "designerCon"
      ).findOne(id);

      return data?.formJson;
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async uploadConfiguration(id: string, configuration: string) {
    try {
      const parsedConfiguration = JSON.parse(configuration);
      const repo = getCustomRepository(FormRepository, "designerCon");
      const existing = await repo.findOne(id);

      if (existing) {
        existing.name = parsedConfiguration.name || id;
        existing.feedbackForm =
          parsedConfiguration.feedback?.feedbackForm || false;
        existing.formJson = configuration;
        repo.save(existing);
      } else {
        const newForm = new Form();
        newForm.id = id;
        newForm.formJson = configuration;
        newForm.name = parsedConfiguration.name || id;
        newForm.feedbackForm =
          parsedConfiguration.feedback?.feedbackForm || false;
        repo.save(newForm);
      }
      return;
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, JSON.parse(configuration).values);
  }
}
