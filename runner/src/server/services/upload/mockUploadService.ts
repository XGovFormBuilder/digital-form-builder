import { UploadService } from "./uploadService";

export class MockUploadService extends UploadService {
  async uploadDocuments(locations: any[]) {
    const shouldFailOCR = locations.find(
      (location) => location.hapi.filename === "fails-ocr.png"
    );
    const responseData = {
      res: {
        statusCode: 201,
        headers: {
          location: "https://document-upload-endpoint",
        },
      },
      payload: shouldFailOCR && "imageQualityWarning",
    };

    return this.parsedDocumentUploadResponse(responseData);
  }
}
