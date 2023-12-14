import { UploadService } from "./uploadService";

export class MockUploadService extends UploadService {
  async uploadDocuments(locations: any[]) {
    const shouldFail =
      locations.filter((location) => location.hapi.filename === "bad-file.png")
        .length > 0;
    const responseData = shouldFail
      ? {
          res: {
            statusCode: 201,
            headers: {
              location: "https://document-upload-endpoint",
            },
          },
          payload: "imageQualityWarning",
        }
      : {
          res: {
            statusCode: 201,
            headers: {
              location: "https://document-endpoint.com",
            },
          },
          payload: undefined,
        };

    return this.parsedDocumentUploadResponse(responseData);
  }
}
