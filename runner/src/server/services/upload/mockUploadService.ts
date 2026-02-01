import { UploadService } from "./uploadService";
import { HapiRequest } from "../../types";

/**
 * @deprecated This class is deprecated and will be removed in a future version.
 * The mock functionality has been integrated into UploadService.
 * UploadService now automatically uses mock uploads when documentUploadApiUrl is not configured.
 * Please remove usage of MockUploadService and use UploadService directly.
 */
export class MockUploadService extends UploadService {
  /**
   * @deprecated Use UploadService.uploadDocuments() instead.
   * Mock behavior is now automatic when no upload URL is configured.
   */
  async uploadDocuments(locations: any[], request?: HapiRequest) {
    // Forward to parent class which now handles mocking internally
    return super.uploadDocuments(locations, request);
  }
}
