import FormData from "form-data";

import config from "../config";
import { get, post } from "./httpService";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "../types";

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
  constructor(server) {
    this.logger = server.logger;
  }

  get fileSizeLimit() {
    return 5 * 1024 * 1024; // 5mb
  }

  get validFiletypes(): ["jpg", "jpeg", "png", "pdf"] {
    return ["jpg", "jpeg", "png", "pdf"];
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

  async handleUploadRequest(
    request: HapiRequest,
    h: HapiResponseToolkit,
    page: any
  ) {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const originalFilenames = state?.originalFilenames ?? {};

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
          request.payload[key] =
            (originalFilename && originalFilename.location) || "";
        }
      }

      return h.continue;
    }

    /**
     * files is an array of tuples containing key and value.
     * value may be an array of file data where multiple files have been uploaded
     */

    for (const file of files) {
      const key = file[0];
      const previousUpload = originalFilenames[key] || {};

      let values: any;

      if (Array.isArray(file[1])) {
        values = file[1];
      } else {
        values = [file[1]];
      }

      const validFiles = (
        await Promise.all(
          values.map(async (fileValue) => {
            const extension = fileValue.hapi.filename.split(".").pop();
            if (
              !this.validFiletypes.includes((extension || "").toLowerCase())
            ) {
              request.pre.errors = [
                ...(h.request.pre.errors || []),
                parsedError(
                  key,
                  `The selected file for "%s" must be a ${this.validFiletypes
                    .slice(0, -1)
                    .join(", ")} or ${this.validFiletypes.slice(-1)}`
                ),
              ];
              return null;
            }
            try {
              return fileValue;
            } catch (e) {
              request.pre.errors = [
                ...(h.request.pre.errors || []),
                parsedError(key, e),
              ];
            }
          })
        )
      ).filter((value) => !!value);

      if (validFiles.length === values.length) {
        try {
          const { error, location, warning } = await this.uploadDocuments(
            validFiles
          );
          if (location) {
            originalFilenames[key] = { location };
            request.payload[key] = location;
            request.pre.warning = warning;
          }
          if (error) {
            request.pre.errors = [
              ...(h.request.pre.errors || []),
              parsedError(key, error),
            ];
          }
        } catch (e) {
          if (e.data?.res) {
            const { error } = this.parsedDocumentUploadResponse(e.data);
            request.pre.errors = [
              ...(h.request.pre.errors || []),
              parsedError(key, error),
            ];
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
              parsedError(key, e),
            ];
          }
        }
      } else {
        request.payload[key] = previousUpload.location || "";
      }

      if (request.pre.errors && request.pre.errors.length) {
        delete request.payload[key];
      }
    }

    await cacheService.mergeState(request, { originalFilenames });

    if (request.pre?.warning && page?.controller === "UploadPageController") {
      return h.redirect("?view=playback").takeover();
    }

    return h.continue;
  }

  downloadDocuments(paths: string[]) {
    const promises = paths.map((path) => get<string>(path, {}));
    return Promise.all(promises);
  }
}
