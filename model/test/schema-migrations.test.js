import * as Code from '@hapi/code'
import * as Lab from '@hapi/lab'
import sinon from 'sinon'
import { SchemaMigrationService } from '../src/migration/schema-migrations'

const { expect } = Code
const lab = Lab.script()
exports.lab = lab

const { afterEach, beforeEach, describe, suite, test } = lab

class StubbedMigration {
  constructor (initialVersion, mutator) {
    this.initialVersion = initialVersion
    this.mutator = mutator
  }

  getInitialVersion () {
    return this.initialVersion
  }

  migrate (formDef) {
    this.mutator(formDef)
    return formDef
  }
}

suite('SchemaMigrationService', () => {
  const logger = {
    info: sinon.spy(),
    error: sinon.spy()
  }
  const migrations = [
    new StubbedMigration(0, def => { def.migration1 = true }),
    new StubbedMigration(1, def => { def.migration2 = true }),
    new StubbedMigration(2, def => { def.migration3 = true })
  ]
  const underTest = new SchemaMigrationService({ })
  underTest.logger = logger

  beforeEach(() => {
    underTest.migrations = migrations
  })

  afterEach(() => {
    logger.error.resetHistory()
  })

  describe('For a form with no version', () => {
    test('should apply migrations in order starting from version zero', () => {
      const def = {}
      const returned = underTest.migrate(def)
      expect(returned.migration1).to.equal(true)
      expect(returned.migration2).to.equal(true)
      expect(returned.migration3).to.equal(true)
      expect(returned.version).to.equal(3)
    })

    test('should do nothing if there are no migrations', () => {
      underTest.migrations = []
      const def = {}
      const returned = underTest.migrate(def)
      expect(returned).to.equal({})
    })
  })

  describe('For a form with a zero version', () => {
    test('should apply migrations in order starting from version zero', () => {
      const def = { version: 0 }
      const returned = underTest.migrate(def)
      expect(returned.migration1).to.equal(true)
      expect(returned.migration2).to.equal(true)
      expect(returned.migration3).to.equal(true)
      expect(returned.version).to.equal(3)
    })

    test('should do nothing if there are no migrations', () => {
      underTest.migrations = []
      const def = {}
      const returned = underTest.migrate(def)
      expect(returned).to.equal({})
    })
  })

  describe('For a form with a version greater than zero', () => {
    test('should apply migrations in order starting from the specified version', () => {
      const def = { version: 1 }
      const returned = underTest.migrate(def)
      expect(returned.migration1).to.equal(undefined)
      expect(returned.migration2).to.equal(true)
      expect(returned.migration3).to.equal(true)
      expect(returned.version).to.equal(3)
    })

    test('should do nothing if the form is already at the highest available version', () => {
      const def = { version: 3 }
      const returned = underTest.migrate(def)
      expect(returned).to.equal({ version: 3 })
    })

    test('should log an error if the form version is higher than the highest available migration', () => {
      const def = { version: 4 }
      const returned = underTest.migrate(def)
      expect(returned).to.equal({ version: 4 })
      expect(logger.error.callCount).to.equal(1)
      expect(logger.error.firstCall.args[0]).to.equal('New schema version 4 has no corresponding migration')
    })

    test('should log an error if the form version is one for which no migration is available', () => {
      const def = { version: 1 }
      underTest.migrations = [
        new StubbedMigration(0, def => { def.migration1 = true }),
        new StubbedMigration(2, def => { def.migration3 = true })
      ]
      const returned = underTest.migrate(def)
      expect(returned).to.equal({ version: 1 })
      expect(logger.error.callCount).to.equal(1)
      expect(logger.error.firstCall.args[0]).to.equal('Found a migration from version 2 but the schema is only at version 1')
    })

    test('should log an error if the form is migrated to a version for which no migration is available', () => {
      const def = { version: 0 }
      underTest.migrations = [
        new StubbedMigration(0, def => { def.migration1 = true }),
        new StubbedMigration(2, def => { def.migration3 = true })
      ]
      const returned = underTest.migrate(def)
      expect(returned).to.equal({ version: 1, migration1: true })
      expect(logger.error.callCount).to.equal(1)
      expect(logger.error.firstCall.args[0]).to.equal('Found a migration from version 2 but the schema is only at version 1')
    })
  })
})
