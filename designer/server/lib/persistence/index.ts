import { S3PersistenceService } from "./s3PersistenceService";
import { BlobPersistenceService } from "./blobPersistenceService";
import { StubPersistenceService } from "./persistenceService";
import { PreviewPersistenceService } from "./previewPersistenceService";
import { PGPersistenceService } from "./pgPersistenceService";

type Name = "s3" | "blob" | "preview" | "pg";

export function determinePersistenceService(name: Name, server: any) {
  switch (name) {
    case "s3":
      return () => new S3PersistenceService(server);
    case "blob":
      return () => new BlobPersistenceService();
    case "preview":
      return () => new PreviewPersistenceService();
    case "pg":
      return () => new PGPersistenceService(server);
    default:
      return () => new StubPersistenceService();
  }
}
