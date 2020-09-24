import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import sinon from 'sinon'
import ListItemReferencesToValueObjects from '../src/migration/list-item-references-to-value-objects'

import { clone } from '../src/helpers'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab

const { afterEach, describe, suite, test } = lab

suite('ListItemReferencesToValueObjects', () => {
  const logger = {
    info: sinon.spy(),
    error: sinon.spy()
  }
  const underTest = new ListItemReferencesToValueObjects({})
  underTest.logger = logger

  afterEach(() => {
    logger.error.resetHistory()
  })

  test('Initial version should always be 0', () => {
    expect(underTest.getInitialVersion()).to.equal(0)
    expect(underTest.getInitialVersion()).to.equal(0)
  })

  function permutations (fieldTypes, valueTypes) {
    return fieldTypes.flatMap(fieldType => valueTypes.map(valueType => ({ fieldType, valueType })))
  }

  describe('migration', () => {
    const testCases = permutations(
      ['RadiosField', 'CheckboxesField', 'YesNoField', 'SelectField', 'AutocompleteField', 'FlashCard', 'List'],
      ['number', 'string']
    )

    testCases.forEach(testCase => {
      test(`should ignore definition with field of type ${testCase.fieldType} which is already migrated`, () => {
        const def = migratedDef(testCase)
        expect(underTest.migrate(def)).to.equal(def)
      })

      test(`should correct definition with field of type ${testCase.fieldType} which is already migrated but does not have the correct version identifier`, () => {
        const def = migratedDef(testCase)
        const copy = clone(def)
        delete copy.version
        expect(underTest.migrate(copy)).to.equal(def)
      })

      test(`should migrate definition with field of type ${testCase.fieldType} and ${testCase.valueType} values with no initial version identifier`, () => {
        const def = unmigratedDef(testCase)
        const copy = clone(def)
        delete copy.version
        const expected = migratedDef(testCase)
        expect(underTest.migrate(copy)).to.equal(expected)
      })

      test(`should migrate definition with field of type ${testCase.fieldType} and ${testCase.valueType} values with an initial version identifier`, () => {
        const def = unmigratedDef(testCase)
        const expected = migratedDef(testCase)
        expect(underTest.migrate(def)).to.equal(expected)
      })
    })
  })
})

function migratedDef (testCase) {
  return {
    conditions: [],
    startPage: '/start',
    pages: [
      {
        path: '/start',
        components: [
          {
            options: {
              bold: true
            },
            type: testCase.fieldType,
            name: 'licenceLength',
            title: {
              en: 'Which fishing licence do you want to get?',
              fr: 'some french'
            },
            schema: {},
            values: {
              type: 'listRef',
              list: 'licenceLengthDays',
              valueChildren: [
                {
                  value: 365,
                  children: [
                    {
                      name: 'aName',
                      type: 'RadiosField',
                      options: {},
                      values: {
                        list: 'anotherList',
                        type: 'listRef',
                        valueChildren: []
                      }
                    }
                  ]
                }
              ]
            }
          }
        ],
        section: 'licenceDetails',
        next: [
          {
            path: '/full-name'
          }
        ]
      },
      {
        path: '/full-name',
        components: [
          {
            schema: {
              max: 70
            },
            type: 'TextField',
            name: 'fullName',
            title: {
              en: "What's your name?",
              fr: 'some french'
            }
          }
        ],
        section: 'personalDetails',
        next: [
          {
            path: '/summary'
          }
        ]
      },
      {
        path: '/summary',
        controller: './../../plugins/builder/pages/summary.js',
        components: [],
        title: 'Summary'
      }
    ],
    sections: [
      {
        name: 'personalDetails',
        title: 'Personal details'
      },
      {
        name: 'licenceDetails',
        title: 'Licence details'
      }
    ],
    lists: [
      {
        name: 'licenceLengthDays',
        title: 'Licence length (days)',
        type: testCase.valueType,
        items: [
          {
            text: '1 day',
            value: 1,
            description: 'Valid for 24 hours from the start time that you select'
          },
          {
            text: '8 day',
            value: 8,
            description: 'Valid for 8 consecutive days from the start time that you select',
            condition: 'myCondition'
          },
          {
            text: '12 months',
            value: 365,
            description: '12-month licences are now valid for 365 days from their start date and can be purchased at any time during the year',
            conditional: {
              components: [
                {
                  name: 'aName',
                  type: 'RadiosField',
                  options: {},
                  values: {
                    list: 'anotherList',
                    type: 'listRef',
                    valueChildren: []
                  }
                }
              ]
            }
          }
        ]
      },
      {
        name: 'anotherList',
        title: 'Licence length (minutes)',
        type: testCase.valueType,
        items: [
          {
            text: '1 minute',
            value: 1,
            description: 'Valid for 1 minute from the start time that you select'
          },
          {
            text: '8 minutes',
            value: 8,
            description: 'Valid for 8 consecutive minutes from the start time that you select',
            condition: 'myCondition'
          },
          {
            text: '12 minutes',
            value: 12,
            description: '12-minute licences are now valid for an absurdly short period of time from their start date and can be purchased at any time during the year'
          }
        ]
      }
    ],
    version: 1
  }
}

function unmigratedDef (testCase) {
  return {
    conditions: [],
    startPage: '/start',
    pages: [
      {
        path: '/start',
        components: [
          {
            options: {
              list: 'licenceLengthDays',
              bold: true
            },
            type: testCase.fieldType,
            name: 'licenceLength',
            title: {
              en: 'Which fishing licence do you want to get?',
              fr: 'some french'
            },
            schema: {}
          }
        ],
        section: 'licenceDetails',
        next: [
          {
            path: '/full-name'
          }
        ]
      },
      {
        path: '/full-name',
        components: [
          {
            schema: {
              max: 70
            },
            type: 'TextField',
            name: 'fullName',
            title: {
              en: "What's your name?",
              fr: 'some french'
            }
          }
        ],
        section: 'personalDetails',
        next: [
          {
            path: '/summary'
          }
        ]
      },
      {
        path: '/summary',
        controller: './../../plugins/builder/pages/summary.js',
        components: [],
        title: 'Summary'
      }
    ],
    sections: [
      {
        name: 'personalDetails',
        title: 'Personal details'
      },
      {
        name: 'licenceDetails',
        title: 'Licence details'
      }
    ],
    lists: [
      {
        name: 'licenceLengthDays',
        title: 'Licence length (days)',
        type: testCase.valueType,
        items: [
          {
            text: '1 day',
            value: 1,
            description: 'Valid for 24 hours from the start time that you select'
          },
          {
            text: '8 day',
            value: 8,
            description: 'Valid for 8 consecutive days from the start time that you select',
            condition: 'myCondition'
          },
          {
            text: '12 months',
            value: 365,
            description: '12-month licences are now valid for 365 days from their start date and can be purchased at any time during the year',
            conditional: {
              components: [{ name: 'aName', type: 'RadiosField', options: { list: 'anotherList' } }]
            }
          }
        ]
      },
      {
        name: 'anotherList',
        title: 'Licence length (minutes)',
        type: testCase.valueType,
        items: [
          {
            text: '1 minute',
            value: 1,
            description: 'Valid for 1 minute from the start time that you select'
          },
          {
            text: '8 minutes',
            value: 8,
            description: 'Valid for 8 consecutive minutes from the start time that you select',
            condition: 'myCondition'
          },
          {
            text: '12 minutes',
            value: 12,
            description: '12-minute licences are now valid for an absurdly short period of time from their start date and can be purchased at any time during the year'
          }
        ]
      }
    ],
    version: 0
  }
}
