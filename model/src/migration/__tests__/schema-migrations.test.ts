// @ts-nocheck

import { SchemaMigrationService } from "../schema-migrations";

class StubbedMigration {
  constructor(initialVersion, mutator) {
    this.initialVersion = initialVersion;
    this.mutator = mutator;
  }

  getInitialVersion() {
    return this.initialVersion;
  }

  migrate(formDef) {
    this.mutator(formDef);
    return formDef;
  }
}

describe("SchemaMigrationService", () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const migrations = [
    new StubbedMigration(0, (def) => {
      def.migration1 = true;
    }),
    new StubbedMigration(1, (def) => {
      def.migration2 = true;
    }),
    new StubbedMigration(2, (def) => {
      def.migration3 = true;
    }),
  ];
  const underTest = new SchemaMigrationService({});
  underTest.logger = logger;

  beforeEach(() => {
    underTest.migrations = migrations;
  });

  afterEach(() => {
    logger.error.mockClear();
  });

  describe("For a form with no version", () => {
    test("should apply migrations in order starting from version zero", () => {
      const def = {};
      const returned = underTest.migrate(def);
      expect(returned.migration1).toEqual(true);
      expect(returned.migration2).toEqual(true);
      expect(returned.migration3).toEqual(true);
      expect(returned.version).toEqual(3);
    });

    test("should do nothing if there are no migrations", () => {
      underTest.migrations = [];
      const def = {};
      const returned = underTest.migrate(def);
      expect(returned).toEqual({});
    });
  });

  describe("For a form with a zero version", () => {
    test("should apply migrations in order starting from version zero", () => {
      const def = { version: 0 };
      const returned = underTest.migrate(def);
      expect(returned.migration1).toEqual(true);
      expect(returned.migration2).toEqual(true);
      expect(returned.migration3).toEqual(true);
      expect(returned.version).toEqual(3);
    });

    test("should do nothing if there are no migrations", () => {
      underTest.migrations = [];
      const def = {};
      const returned = underTest.migrate(def);
      expect(returned).toEqual({});
    });
  });

  describe("For a form with a version greater than zero", () => {
    test("should apply migrations in order starting from the specified version", () => {
      const def = { version: 1 };
      const returned = underTest.migrate(def);
      expect(returned.migration1).toEqual(undefined);
      expect(returned.migration2).toEqual(true);
      expect(returned.migration3).toEqual(true);
      expect(returned.version).toEqual(3);
    });

    test("should do nothing if the form is already at the highest available version", () => {
      const def = { version: 3 };
      const returned = underTest.migrate(def);
      expect(returned).toEqual({ version: 3 });
    });

    test("should log an error if the form version is higher than the highest available migration", () => {
      const def = { version: 4 };
      const returned = underTest.migrate(def);
      expect(returned).toEqual({ version: 4 });
      expect(logger.error.mock.calls.length).toEqual(1);
      expect(logger.error.mock.calls[0][0]).toEqual(
        "New schema version 4 has no corresponding migration"
      );
    });

    test("should log an error if the form version is one for which no migration is available", () => {
      const def = { version: 1 };
      underTest.migrations = [
        new StubbedMigration(0, (def) => {
          def.migration1 = true;
        }),
        new StubbedMigration(2, (def) => {
          def.migration3 = true;
        }),
      ];
      const returned = underTest.migrate(def);
      expect(returned).toEqual({ version: 1 });
      expect(logger.error.mock.calls.length).toEqual(1);
      expect(logger.error.mock.calls[0][0]).toEqual(
        "Found a migration from version 2 but the schema is only at version 1"
      );
    });

    test("should log an error if the form is migrated to a version for which no migration is available", () => {
      const def = { version: 0 };
      underTest.migrations = [
        new StubbedMigration(0, (def) => {
          def.migration1 = true;
        }),
        new StubbedMigration(2, (def) => {
          def.migration3 = true;
        }),
      ];
      const returned = underTest.migrate(def);
      expect(returned).toEqual({ version: 1, migration1: true });
      expect(logger.error.mock.calls.length).toEqual(1);
      expect(logger.error.mock.calls[0][0]).toEqual(
        "Found a migration from version 2 but the schema is only at version 1"
      );
    });
  });
});
