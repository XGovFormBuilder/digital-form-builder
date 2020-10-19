import { PersistenceService } from "./persistenceService";

export class BlobPersistenceService implements PersistenceService {
  logger: any;

  uploadConfiguration(_id: string, _configuration: string) {
    return Promise.resolve(undefined);
  }

  listAllConfigurations() {
    return Promise.resolve([]);
  }

  getConfiguration(_id: string) {
    return Promise.resolve("");
  }
  copyConfiguration(_configurationId: string, _newName: string) {
    return Promise.resolve("");
  }
}
