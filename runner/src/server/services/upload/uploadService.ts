import FormData from "form-data";

import config from "../../config";
import { HapiRequest, HapiResponseToolkit, HapiServer } from "../../types";
import { get, post } from "../httpService";

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

  async uploadDocuments(streams: any[], request?: HapiRequest) {
    const form = this.buildFormData(streams);

    const uploadUrl = request
      ? this.getUploadUrl(request)
      : this.getDefaultUploadUrl();

    if (!uploadUrl) {
      return this.mockUpload(streams);
    }

    const requestData = await this.buildUploadRequest(form);

    const responseData = await post(uploadUrl, requestData);

    return this.parsedDocumentUploadResponse(responseData);
  }

  private buildFormData(streams: any[]): FormData {
    const form = new FormData();
    for (const stream of streams) {
      form.append("files", stream, {
        filename: stream.hapi.filename,
        contentType: stream.hapi.headers["content-type"],
      });
    }
    return form;
  }

  private getUploadUrl(request: HapiRequest): string {
    const id = request.params?.id;
    const forms = request.server?.app?.forms;
    const model = id && forms?.[id];

    // TODO: Kept as previous to avoid breaking, but endpoint should be defined with the URL, not appended here
    const endpoint = "/v1/files";
    const baseUrl =
      model?.def?.documentUploadApiUrl ?? config.documentUploadApiUrl;

    this.validateUploadUrl(baseUrl);

    return `${baseUrl}${endpoint}`;
  }

  private getDefaultUploadUrl(): string | undefined {
    const baseUrl = config.documentUploadApiUrl;
    if (!baseUrl) {
      return undefined;
    }
    this.validateUploadUrl(baseUrl);
    const endpoint = "/v1/files";
    return `${baseUrl}${endpoint}`;
  }

  private validateUploadUrl(
    baseUrl: string | undefined
  ): asserts baseUrl is string {
    if (!baseUrl) {
      throw new Error(
        "Document upload API URL is not configured. Please set documentUploadApiUrl in config or model definition."
      );
    }

    if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
      throw new Error("Document upload API URL must be a non-empty string.");
    }
  }

  private async buildUploadRequest(form: FormData) {
    const formHeaders = form.getHeaders();

    return {
      headers: { ...formHeaders },
      payload: form,
    };
  }

  parsedDocumentUploadResponse({ res, payload }: { res: any; payload?: any }) {
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
    const acceptedTypes = customAcceptedTypes ?? this.validContentTypes;

    return acceptedTypes.includes(contentType);
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

  // TODO: should this be async?
  private mockUpload(streams: any[]) {
    const shouldFailOCR = streams.find(
      (stream) => stream.hapi.filename === "fails-ocr.png"
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
  "application/vnd.oasis.opendocument.text": "odt",
  // "application/zip": "zip"
};
