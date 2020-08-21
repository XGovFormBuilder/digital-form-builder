// @flow
import { FormConfiguration } from 'digital-form-builder-model'

export interface PersistenceService {
  logger: any;
  listAllConfigurations (): Promise<FormConfiguration[]>;
  getConfiguration (id: string): Promise<string>;
  uploadConfiguration (id: string, configuration: any): Promise<any>;
  copyConfiguration (configurationId: string, newName: string): Promise<any>;
}

export class StubPersistenceService implements PersistenceService {
  logger: any
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
