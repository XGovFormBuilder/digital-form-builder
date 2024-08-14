import FormData from "form-data";

import config from "../../config";
import { get, post } from "../httpService";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "../../types";

type Payload = HapiRequest["payload"];
type HapiReadableStream = ReadableStream & {
  hapi: {
    filename: string;
    headers: {
      "content-disposition": string;
      "content-type": string;
    };
  };
};
export type ReadableStreamEntry = [string, Array<HapiReadableStream>];

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

  validContentTypes = new Set(["image/jpeg", "application/pdf", "image/png"]);
  validFiletypes = ["jpg", "jpeg", "png", "pdf"];
  validFiletypesString = `The selected file for "%s" must be a ${this.validFiletypes
    .slice(0, -1)
    .join(", ")} or ${this.validFiletypes.slice(-1)}`;

  get fileSizeLimit() {
    return config.maxClientFileSize;
  }

  isReadable(value: any | HapiReadableStream) {
    return value?.isReadable;
  }

  payloadEntryIsFile(entry: [string, any]) {
    const [key, value] = entry;
    if (!value) {
      return;
    }

    if (Array.isArray(value)) {
      return value.every((v) => v?.readable);
    }
    return value?.readable;
  }

  convertFileValueToArray(
    entry: [string, HapiReadableStream | HapiReadableStream[]]
  ): [string, HapiReadableStream[]] {
    const [key, value] = entry;
    if (Array.isArray(value)) {
      return [key, value];
    }
    return [key, [value]];
  }

  fileStreamsFromPayload(payload: Payload): ReadableStreamEntry[] {
    if (!payload) {
      return [];
    }
    const entries = Object.entries(payload);
    const payloadFileEntries = entries.filter(this.payloadEntryIsFile);
    return payloadFileEntries.map(this.convertFileValueToArray);
  }

  fileSummary(files: ReadableStreamEntry[]) {
    return files.map(([fieldName, value]) => {
      return `${value.length} files for field ${fieldName}`;
    });
  }

  async uploadDocuments(streams: any[]) {
    const form = new FormData();
    for (const stream of streams) {
      form.append("files", stream, {
        filename: stream.hapi.filename,
        contentType: stream.hapi.headers["content-type"],
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

  validateContentType(file: HapiReadableStream) {
    return this.validContentTypes.has(file?.hapi?.headers?.["content-type"]);
  }

  invalidFileTypeError(fieldName: string) {
    return parsedError(fieldName, this.validFiletypesString);
  }

  downloadDocuments(paths: string[]) {
    const promises = paths.map((path) => get<string>(path, {}));
    return Promise.all(promises);
  }

  getLoggerIdentifier(request: HapiRequest, mergedObject: Object) {
    return {
      id: request.yar.id,
      path: request.path,
      ...mergedObject,
    };
  }
}
