import FormData from "form-data";

import config from "../../config";
import { get, post, Response } from "../httpService";
import { createHmacRaw } from "../../utils/hmac";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "../../types";
import { ServerConfiguration } from "src/server/utils/configSchema";

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
  fileSizeError: "The selected files are too large",
  fileTypeError: "Invalid file type. Upload a PNG, JPG or PDF",
  fileCountError: "You have selected too many files",
  virusError: "The selected files contain a virus",
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

  async uploadDocuments(
    streams: HapiReadableStream[],
    uploadConfig: { url: string; additionalHeaders?: Record<string, string> }
  ) {
    const form = new FormData();
    for (const stream of streams) {
      form.append("files", stream, {
        filename: stream.hapi.filename,
        contentType: stream.hapi.headers["content-type"],
      });
    }

    let formHeaders = form.getHeaders();

    if (uploadConfig.additionalHeaders) {
      /* Support form specific file upload api security headers */
      formHeaders = { ...formHeaders, ...uploadConfig.additionalHeaders };
    }

    const requestData = { headers: formHeaders, payload: form };
    const responseData = await post(`${uploadConfig.url}`, requestData);

    return this.parsedDocumentUploadResponse(responseData);
  }

  parsedDocumentUploadResponse({ res, payload }: Response<any>) {
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
        if (errorCode === "TOO_MANY_FILES") {
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
    const contentType = file?.hapi?.headers?.["content-type"];
    const filename = file?.hapi?.filename;
    const acceptedTypes = customAcceptedTypes ?? this.validContentTypes;

    let isValid = acceptedTypes.includes(contentType);

    // Fallback: allow .ris files with 'application/octet-stream'
    // API BACKEND - Will be used to scan if this is actually what it claims to be ...
    if (!isValid && filename?.endsWith(".ris")) {
      this.logger.warn("UPLOAD_WARNING", {
        reason: "RIS file had generic content type",
        filename,
        contentType,
      });
      isValid = true;
    }

    // Fallback: allow .msg files with 'application/octet-stream'
    if (!isValid && filename?.endsWith(".msg")) {
      this.logger.warn("UPLOAD_WARNING", {
        reason: "RIS file had generic content type",
        filename,
        contentType,
      });
      isValid = true;
    }
    return isValid;
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

  getFileUploadUrl = (
    serverConfig: ServerConfiguration,
    request: HapiRequest
  ) => {
    let url = "";

    /* Prioritize form level url */
    const formId = request.params?.id;
    if (formId) {
      const forms = request.server?.app?.forms;
      if (forms) {
        const formModel = forms[formId];
        if (formModel) {
          const formLevelUploadUrl = formModel.def.documentUploadApiUrl;
          if (formLevelUploadUrl && formLevelUploadUrl.trim().length > 0)
            url = formLevelUploadUrl;
        }
      }
    }

    /* Fall back to server level url */
    if (!url && serverConfig.documentUploadApiUrl) {
      url = `${serverConfig.documentUploadApiUrl}/v1/files`;
    }

    return url;
  };
}

/**
 * Commonly used content/mime type to names. These will be rendered in error messages.
 */
const contentTypeToName = {
  "image/jpeg": "jpg, jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
  "application/vnd.ms-excel.sheet.macroEnabled.12": "xlsm",
  "application/xml": "xml",
  "application/pdf": "pdf",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/rtf": "rtf",
  "text/rtf": "rtf",
  "application/msword": "doc",
  "application/x-research-info-systems": "ris",
  "text/ris": "ris",
  "text/plain": "txt",
  "application/vnd.ms-outlook": "msg",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/vnd.ms-excel": "xls",
  // "application/zip": "zip"
};
