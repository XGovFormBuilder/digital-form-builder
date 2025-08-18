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
  fileSizeError: 'The selected files are too large',
  fileTypeError: "Invalid file type. Upload a PNG, JPG or PDF",
  fileCountError: 'You have selected too many files for "%s"',
  virusError: 'The selected files contained a virus',
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

  validContentTypes = ["image/jpeg", "image/png", "application/pdf"];

  validFiletypesString(customAcceptedTypes?: string[]) {
    const acceptedTypes = customAcceptedTypes ?? this.validContentTypes;

    let acceptedTypeNames = acceptedTypes
      .map((type) => contentTypeToName[type])
      .filter(Boolean)
      .map((type) => type.toUpperCase());

    const namesSet = new Set(acceptedTypeNames);
    acceptedTypeNames = Array.from(namesSet);
    
    const acceptedTypesNameWithoutLast = acceptedTypeNames
      .slice(0, -1)
      .join(", ");
    const lastAcceptedTypeName = acceptedTypeNames.slice(-1);

    return `The selected files must be a ${acceptedTypesNameWithoutLast} or ${lastAcceptedTypeName}`;
  }

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
      return `${value?.length ?? 0} files for field ${fieldName}`;
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
    const payloadString = payload?.toString?.();
    let payloadJson: any;
    let warning: string | undefined;
    let errorCode: string | undefined;

    try {
      payloadJson = payloadString ? JSON.parse(payloadString) : undefined;
      errorCode = payloadJson?.errorCode;
      warning = payloadJson?.warning;
    } catch (e) {
      warning = payloadString;
    }

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
        if(errorCode === "TOO_MANY_FILES") {
          if (payloadJson?.maxFilesPerUpload) {
            error = `You can only select up to ${payloadJson?.maxFilesPerUpload} files at the same time`;
          } else {
            error = ERRORS.fileCountError;
          }
        } else {
          error = ERRORS.fileSizeError;
        }
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

  validateContentType(
    file: HapiReadableStream,
    customAcceptedTypes?: string[]
  ) {
    const acceptedTypes = customAcceptedTypes ?? this.validContentTypes;

    return acceptedTypes.includes(file?.hapi?.headers?.["content-type"]);
  }

  invalidFileTypeError(fieldName: string, customAcceptedTypes?: string[]) {
    return parsedError(
      fieldName,
      this.validFiletypesString(customAcceptedTypes)
    );
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

/**
 * Commonly used content/mime type to names. These will be rendered in error messages.
 */
const contentTypeToName = {
  "image/jpeg": "jpg, jpeg",
  "image/png": "png",
  "application/pdf": "pdf",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/csv": "csv",
};
