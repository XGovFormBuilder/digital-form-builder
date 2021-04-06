import { PersistenceService } from "./persistenceService";
import { FormConfiguration, Logger } from "@xgovformbuilder/model";
import { getConnection } from "typeorm";
import { Form } from "../../repositories";
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
      const forms = await getConnection("designerCon").transaction(
        async (em) => {
          const repo = em.getRepository(Form);
          const data = await repo.find();
          return data;
        }
      );
      return forms.map((entry) => {
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
      const form = await getConnection("designerCon").transaction(
        async (em) => {
          const repo = em.getRepository(Form);
          const data = await repo.findOne(id);
          return data;
        }
      );
      return form?.formJson;
    } catch (err) {
      this.logger.error(err);
      return err;
    }
  }

  async uploadConfiguration(id: string, configuration: string) {
    try {
      await getConnection("designerCon").transaction(async (em) => {
        const repo = em.getRepository(Form);
        const parsedConfiguration = JSON.parse(configuration);
        const existing = await repo.findOne(id);
        if (existing) {
          existing.name = parsedConfiguration.name || id;
          existing.feedbackForm =
            parsedConfiguration.feedback?.feedbackForm || false;
          existing.formJson = configuration;
          await repo.save(existing);
        } else {
          const newForm = new Form();
          newForm.id = id;
          newForm.formJson = configuration;
          newForm.name = parsedConfiguration.name || id;
          newForm.feedbackForm =
            parsedConfiguration.feedback?.feedbackForm || false;
          await repo.save(newForm);
        }
      });
      return;
    } catch (err) {
      console.log("Error occurred while uploading configuration", err.message);
      this.logger.error(err);
      return err;
    }
  }

  async copyConfiguration(configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId);
    return this.uploadConfiguration(newName, configuration);
  }
}
