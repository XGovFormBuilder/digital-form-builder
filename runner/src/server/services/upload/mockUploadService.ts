import { HapiRequest } from "src/server/types";
import { UploadService } from "./uploadService";
import { ServerConfiguration } from "src/server/utils/configSchema";

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

  getFileUploadUrl = (
    serverConfig: ServerConfiguration,
    request: HapiRequest
  ) => {
    return "https://mock-document-upload-endpoint";
  };
}
