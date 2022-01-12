import { S3PersistenceService } from "./s3PersistenceService";
import { BlobPersistenceService } from "./blobPersistenceService";
import { StubPersistenceService } from "./persistenceService";
import { PreviewPersistenceService } from "./previewPersistenceService";
import { ApiPersistenceService } from "./apiPersistenceService";

type Name = "s3" | "blob" | "preview" | "api";

export function determinePersistenceService(name: Name, server: any) {
  console.log(name);
  switch (name) {
    case "s3":
      return () => new S3PersistenceService(server);
    case "blob":
      return () => new BlobPersistenceService();
    case "preview":
      return () => new PreviewPersistenceService();
    case "api":
      return () => new ApiPersistenceService();
    default:
      return () => new StubPersistenceService();
  }
}
