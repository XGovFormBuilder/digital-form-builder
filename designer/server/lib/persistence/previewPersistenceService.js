// @flow
import type { PersistenceService } from './persistenceService'
const Wreck = require('@hapi/wreck')
const config = require('../../../config')

export class PreviewPersistenceService implements PersistenceService {
  logger: any;
  async uploadConfiguration (id: string, configuration: string) {
    return Wreck.post(`${config.previewUrl}/publish`, {
      payload: JSON.stringify({ id, configuration })
    })
  }

  async copyConfiguration (configurationId: string, newName: string) {
    const configuration = await this.getConfiguration(configurationId)
    return this.uploadConfiguration(newName, JSON.parse(configuration).values)
  }

  async listAllConfigurations () {
    const { payload } = await Wreck.get(`${config.previewUrl}/published`)
    return Promise.resolve(JSON.parse(payload.toString()))
  }

  async getConfiguration (id: string) {
    const { payload } = await Wreck.get(`${config.previewUrl}/published/${id}`)
    return payload.toString()
  }
}
