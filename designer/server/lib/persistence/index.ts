import { S3PersistenceService } from "./s3PersistenceService";
import { BlobPersistenceService } from "./blobPersistenceService";
import { StubPersistenceService } from "./persistenceService";
import { PreviewPersistenceService } from "./previewPersistenceService";

type Name = "s3" | "blob" | "preview";

export function determinePersistenceService(name: Name) {
  switch (name) {
    case "s3":
      return S3PersistenceService;
    case "blob":
      return BlobPersistenceService;
    case "preview":
      return PreviewPersistenceService;
    default:
      return StubPersistenceService;
  }
}
