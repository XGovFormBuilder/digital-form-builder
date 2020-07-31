// @flow
import { S3PersistenceService } from './s3PersistenceService'
import { BlobPersistenceService } from './blobPersistenceService'
import { StubPersistenceService } from './persistenceService'

export function determinePersistenceService (name: "s3" | "blob") {
  switch (name) {
    case 's3' : return S3PersistenceService
    case 'blob' : return BlobPersistenceService
    default: return StubPersistenceService
  }
}
