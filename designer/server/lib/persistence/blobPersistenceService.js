// @flow
import type { PersistenceService } from './persistenceService'

export class BlobPersistenceService implements PersistenceService {
  logger: any;
  uploadConfiguration (id: string, configuration: any) {
    return Promise.resolve(undefined)
  }

  listAllConfigurations () {
    return Promise.resolve([])
  }

  getConfiguration (id: string) {
    return Promise.resolve('')
  }
  copyConfiguration (configurationId: string, newName: string) {
    return Promise.resolve('')
  }
}
