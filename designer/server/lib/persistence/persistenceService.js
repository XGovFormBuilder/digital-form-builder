// @flow
export interface PersistenceService {
  logger: any;
  listAllConfigurations (): Promise<string[]>;
  getConfiguration (id: string): Promise<string>;
  uploadConfiguration (id: string, configuration: any): Promise<any>;
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
}
