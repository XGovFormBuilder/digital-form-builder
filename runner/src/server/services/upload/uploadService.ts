import FormData from "form-data";

import config from "../../config";
import { get, post } from "../httpService";
import { createHmacRaw } from "../../utils/hmac";
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

  validContentTypes = ["image/jpeg", "image/png", "application/pdf"];

  validFiletypesString(customAcceptedTypes?: string[]) {
    const acceptedTypes = customAcceptedTypes ?? this.validContentTypes;

    const acceptedTypeNames = acceptedTypes
      .map((type) => contentTypeToName[type])
      .filter(Boolean);

    const acceptedTypesNameWithoutLast = acceptedTypeNames
      .slice(0, -1)
      .join(", ");
    const lastAcceptedTypeName = acceptedTypeNames.slice(-1);

    return `The selected file for "%s" must be a ${acceptedTypesNameWithoutLast} or ${lastAcceptedTypeName}`;
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

  async uploadDocuments(streams: any[], request: HapiRequest) {
    const form = new FormData();
    for (const stream of streams) {
      form.append("files", stream, {
        filename: stream.hapi.filename,
        contentType: stream.hapi.headers["content-type"],
      });
    }

  const formHeaders = form.getHeaders();


  const id = request.params?.id;
  const forms = request.server?.app?.forms;
  const model = id && forms?.[id];
  const hmacKey = model?.def?.fileUploadHmacSharedKey;
 
  const [hmacSignature, requestTime] = await createHmacRaw(
    request.yar.id,
    hmacKey
  );

  const customSecurityHeaders = {
    "X-Request-ID": request.yar.id.toString(),
    "X-HMAC-Signature": hmacSignature.toString(),
    "X-HMAC-Time": requestTime.toString(),
  };

  const headers = {
    ...formHeaders, 
    ...customSecurityHeaders, 
  };

  const requestData = { headers, payload: form };
  const responseData = await post(`${config.documentUploadApiUrl}/v1/files`, requestData);

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
      contentType
    });
    isValid = true;
  }


  return isValid;
}  downloadDocuments(paths: string[]) {
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
  "image/gif": "gif",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
  "application/vnd.ms-excel.sheet.macroEnabled.12": "xlsm",
  "application/xml": "xml",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/rtf": "rtf",
  "text/rtf": "rtf", 
  "application/msword": "doc",
  "application/x-research-info-systems": "ris",
  "text/ris": "ris",
  "text/plain": "txt",
  "application/vnd.ms-outlook": "msg",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-excel": "xls"
  // "application/zip": "zip"
};
