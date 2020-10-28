import { Logger } from "../utils/logger";
import ListItemReferencesToValueObjects from "./list-item-references-to-value-objects";

export interface Migration {
  getInitialVersion(): number;
  migrate(formDef: any): any;
}

export class SchemaMigrationService {
  logger: Logger;
  migrations: Array<Migration>;

  constructor(server: any, _options: any) {
    this.logger = new Logger(server, "SchemaMigrationService");
    this.migrations = [new ListItemReferencesToValueObjects(server)];
  }

  migrate(formDef: any): any {
    const orderedMigrations = this.migrations.sort(
      (a, b) => a.getInitialVersion() - b.getInitialVersion()
    );
    const initialFormDefVersion = formDef.version ?? 0;
    const applicableMigrations = orderedMigrations.filter(
      (migration) => migration.getInitialVersion() >= initialFormDefVersion
    );
    applicableMigrations.forEach((migration) => {
      const migrationInitialVersion = migration.getInitialVersion();
      const currentFormDefVersion = formDef.version ?? 0;
      if (currentFormDefVersion === migrationInitialVersion) {
        this.logger.info(
          `Migrating form ${
            formDef.name
          } from version ${migrationInitialVersion} to ${
            migrationInitialVersion + 1
          }`
        );
        formDef = migration.migrate(formDef);
        formDef.version = this.getResultantVersion(migrationInitialVersion);
      } else if (migrationInitialVersion > currentFormDefVersion) {
        this.logger.error(
          `Found a migration from version ${migrationInitialVersion} but the schema is only at version ${currentFormDefVersion}`
        );
      }
    });
    if (orderedMigrations.length > 0) {
      if (
        this.getResultantVersion(
          orderedMigrations[orderedMigrations.length - 1].getInitialVersion()
        ) < initialFormDefVersion
      ) {
        this.logger.error(
          `New schema version ${initialFormDefVersion} has no corresponding migration`
        );
      }
    }
    return formDef;
  }

  getResultantVersion(migrationInitialVersion: number): number {
    return migrationInitialVersion + 1;
  }
}
