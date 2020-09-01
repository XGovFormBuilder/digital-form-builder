import type { Migration } from './schema-migrations'
import { Logger } from '../logger'

const MIGRATABLE_COMPONENT_TYPES = ['RadiosField', 'CheckboxesField', 'YesNoField', 'SelectField', 'AutocompleteField', 'List', 'FlashCard']

export default class ListItemReferencesToValueObjects implements Migration {
  logger: Logger

  constructor (server) {
    this.logger = new Logger(server, 'ListItemReferencesToValueObjects')
  }

  getInitialVersion () {
    return 0
  }

  migrate (formDef: any) : any {
    formDef.version = formDef.version || 1
    formDef.pages.forEach(page => {
      page.components.forEach(component => {
        if (MIGRATABLE_COMPONENT_TYPES.includes(component.type) && component.options.list) {
          const listName = component.options.list
          const list = formDef.lists.find(list => list.name === listName)
          if (list) {
            component.values = {
              type: 'static',
              valueType: list.type,
              items: list.items.map(item => ({
                display: item.text,
                value: item.value,
                hint: item.description
              }))
            }
            delete component.options.list
          } else {
            this.logger.error(`Unable to migrate component with list name ${listName} as the corresponding list does not exist`)
          }
        }
      })
    })
    return formDef
  }
}
