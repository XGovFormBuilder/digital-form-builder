import { S3PersistenceService } from "./s3PersistenceService";
import { BlobPersistenceService } from "./blobPersistenceService";
import { StubPersistenceService } from "./persistenceService";
import { PreviewPersistenceService } from "./previewPersistenceService";

type Name = "s3" | "blob" | "preview";

export function determinePersistenceService(name: Name, server: any) {
  switch (name) {
    case "s3":
      return () => new S3PersistenceService(server);
    case "blob":
      return () => new BlobPersistenceService();
    case "preview":
      return () => new PreviewPersistenceService();
    default:
      return () => new StubPersistenceService();
  }
}
