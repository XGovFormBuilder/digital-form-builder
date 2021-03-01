import { whichMigrations } from "@xgovformbuilder/model";

export function useMigration(form) {
  const version = form.version ?? 0;
  const migrationList = whichMigrations(version);
  try {
    let migratedJson = { ...form };
    migrationList.forEach((migration) => {
      migratedJson = migration(migratedJson);
    });
    return migratedJson;
  } catch (e) {
    console.error("failed to migrate json");
  }
}
