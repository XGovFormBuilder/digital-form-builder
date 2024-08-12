import FormData from "form-data";

import config from "../../config";
import { get, post } from "../httpService";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "../../types";

type Payload = HapiRequest["payload"];

const parsedError = (key: string, error?: string) => {
  return {
    path: key,
    href: `#${key}`,
    name: key,
    text: error,
  };
};

const ERRORS = {
  fileSizeError: 'The selected file for "%s" is too large',
  fileTypeError: "Invalid file type. Upload a PNG, JPG or PDF",
  virusError: 'The selected file for "%s" contained a virus',
  default: "There was an error uploading your file",
};

export class UploadService {
  /**
   * Service responsible for uploading files via the FileUploadField. This service has been registered by {@link #createServer}
   */

  logger: HapiServer["logger"];
  validContentTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);

  constructor(server) {
    this.logger = server.logger;
  }

  get fileSizeLimit() {
    return config.maxClientFileSize;
  }

  get validFiletypes(): ["jpg", "jpeg", "png", "pdf"] {
    return ["jpg", "jpeg", "png", "pdf"];
  }

  incorrectFileTypeError(fieldName: string) {
    return parsedError(
      fieldName,
      `The selected file for "%s" must be a ${this.validFiletypes
        .slice(0, -1)
        .join(", ")} or ${this.validFiletypes.slice(-1)}`
    );
  }

  fileStreamsFromPayload(payload: Payload) {
    return Object.entries(payload).filter(([_key, value]: [string, any]) => {
      if (value) {
        if (Array.isArray(value)) {
          return value.every((nv) => !!nv._data && nv._data.length > 1);
        }
        return !!value._data && value._data.length > 1;
      }
      return false;
    });
  }

  async uploadDocuments(locations: any[]) {
    const form = new FormData();
    for (const location of locations) {
      form.append("files", location, {
        filename: location.hapi.filename,
        contentType: location.hapi.headers["content-type"],
      });
    }

    const requestData = { headers: form.getHeaders(), payload: form };
    const responseData = await post(
      `${config.documentUploadApiUrl}/v1/files`,
      requestData
    );

    return this.parsedDocumentUploadResponse(responseData);
  }

  parsedDocumentUploadResponse({ res, payload }) {
    const warning = payload?.toString?.();
    let error: string | undefined;
    let location: string | undefined;
    switch (res.statusCode) {
      case 201:
        location = res.headers.location;
        break;
      case 400:
        error = ERRORS.fileTypeError;
        break;
      case 413:
        error = ERRORS.fileSizeError;
        break;
      case 422:
        error = ERRORS.virusError;
        break;
      default:
        error = ERRORS.default;
        break;
    }
    return {
      location,
      error,
      warning,
    };
  }

  async failAction(_request: HapiRequest, h: HapiResponseToolkit) {
    h.request.pre.filesizeError = true;
    return h.continue;
  }

  isValidContentType(file) {
    return this.validContentTypes.has(file.hapi.headers["content-type"]);
  }

  async handleUploadRequest(
    request: HapiRequest,
    h: HapiResponseToolkit,
    page: any
  ) {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    let originalFilenames = state?.originalFilenames ?? {};

    let files: [string, any][] = [];

    if (request.payload !== null) {
      files = this.fileStreamsFromPayload(request.payload);
    }

    /**
     * If there are no valid file(buffer)s, reassign any empty buffers with empty string
     * allows bypassing of file upload for whatever reason it doesn't work.
     */
    if (!files.length && request.payload) {
      const fields = Object.entries(request.payload);
      for (const [key, value] of fields) {
        if (value._data) {
          const originalFilename = originalFilenames[key];
          this.logger.info(
            { id: request.yar.id, key },
            `Empty file buffer detected for ${key}, but there was a previous upload`
          );
          if (originalFilename) {
            request.payload[key] = originalFilename.location;
          }
        }
      }

      return h.continue;
    }

    /**
     * files is an array of tuples containing key and value.
     * value may be an array of file data where multiple files have been uploaded
     */
    for (const [fieldName, value] of files) {
      const loggerIdentifier = { id: request.yar.id, fieldName };
      const previousUpload = originalFilenames[fieldName] || {};
      let values: any;

      if (Array.isArray(value)) {
        values = value;
      } else {
        values = [value];
      }

      let validFiles = [];

      for (const file of values) {
        if (this.isValidContentType(file)) {
          validFiles.push(file);
          continue;
        }

        this.logger.error(
          loggerIdentifier,
          `Invalid content type: ${file.hapi.headers["content-type"]} for field ${fieldName}`
        );
      }

      if (validFiles.length !== values.length) {
        request.pre.errors = [
          ...(h.request.pre.errors || []),
          this.incorrectFileTypeError(fieldName),
        ];

        if (!previousUpload.location) {
          delete request.payload[fieldName];
          this.logger.error(
            loggerIdentifier,
            `Deleting ${fieldName} due to invalid content type and no previous uploads`
          );
          continue;
        }

        this.logger.info(
          loggerIdentifier,
          `Attempting to upload ${fieldName} (${validFiles.length} files with valid content type)`
        );

        this.logger.warn(
          loggerIdentifier,
          `There was an issue with the upload, using ${previousUpload.location} instead`
        );
        request.payload[fieldName] = previousUpload.location;
      }

      try {
        const { error, location, warning } = await this.uploadDocuments(
          validFiles
        );
        if (location) {
          originalFilenames[fieldName] = { location };
          request.payload[fieldName] = location;
          request.pre.warning = warning;

          this.logger.info(
            loggerIdentifier,
            `field ${fieldName} uploaded to ${location} ${
              warning ? `With warning: ${warning}` : ""
            }`
          );
        }

        const updatedState = await cacheService.mergeState(request, {
          originalFilenames,
        });

        originalFilenames = updatedState.originalFilenames;
        if (error) {
          this.logger.error(
            loggerIdentifier,
            `Error uploading document: ${error}`
          );
          request.pre.errors = [
            ...(h.request.pre.errors || []),
            parsedError(fieldName, error),
          ];
        }
      } catch (e) {
        if (e.data?.res) {
          const { error } = this.parsedDocumentUploadResponse(e.data);
          request.pre.errors = [
            ...(h.request.pre.errors || []),
            parsedError(fieldName, error),
          ];
          request.payload[fieldName] = previousUpload.location || "";
        } else if (e.code === "EPIPE") {
          // ignore this error, it happens when the request is responded to by the doc upload service before the
          // body has finished being sent. A valid response is still received.
          request.server.log(
            ["info", "documentupload"],
            `Ignoring EPIPE response: ${e.message}`
          );
        } else {
          request.server.log(
            ["error", "documentupload"],
            `Error uploading document: ${e.message}`
          );
          request.pre.errors = [
            ...(h.request.pre.errors || []),
            parsedError(fieldName, e),
          ];
        }
      }
    }

    this.logger.info(
      { id: request.yar.id, allUserFiles: originalFilenames },
      `Finished uploading files on ${request.path}`
    );

    return h.continue;
  }

  downloadDocuments(paths: string[]) {
    const promises = paths.map((path) => get<string>(path, {}));
    return Promise.all(promises);
  }
}
