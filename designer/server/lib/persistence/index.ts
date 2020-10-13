import { S3PersistenceService } from './s3PersistenceService'
import { BlobPersistenceService } from './blobPersistenceService'
import { StubPersistenceService } from './persistenceService'
import { PreviewPersistenceService } from './previewPersistenceService'

export function determinePersistenceService (name: "s3" | "blob" | "preview") {
  switch (name) {
    case 's3' : return S3PersistenceService
    case 'blob' : return BlobPersistenceService
    case 'preview' : return PreviewPersistenceService
    default: return StubPersistenceService
  }
}
