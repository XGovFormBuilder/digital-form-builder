import { HapiRequest, HapiResponseToolkit } from "server/types";
import { ReadableStreamEntry } from "server/services/upload/uploadService";

/**
 * This prehandler must follow {@link getFiles}. This prehandler checks if the content-type in the FormData is correct
 * (or empty). If the user uploaded an empty field, a previous upload will be assigned if it exits.
 */
export async function validateContentTypes(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
  const files = request.pre.files;

  if (!files) {
    return h.continue;
  }

  const { uploadService, cacheService } = request.services([]);
  const logger = request.server.logger;
  const loggerIdentifier = { id: request.yar.id, path: request.path };

  const validFields: ReadableStreamEntry[] = [];
  const erroredFields: {
    fieldName: string;
    customAcceptedTypes?: string[];
  }[] = [];

  const { originalFilenames = {} } = await cacheService.getState(request);

  const { id, path } = request.params;
  const form = request.server.app.forms[id];
  const page = form.pages.find((page) => page.path === `/${path}`);
  const components = page.components.formItems;

  for (const [fieldName, values] of files) {
    const component = components.find(
      (component) => component.name === fieldName
    );

    const customAcceptedTypes = component.customAcceptedTypes;

    const originalFilenameLocation = originalFilenames[fieldName]?.location;

    const filesArePopulated = values.every((value) => value?._data?.length > 1);
    const componentIsOptional = component?.options?.required === false;

    if (!filesArePopulated && componentIsOptional) {
      logger.warn(
        loggerIdentifier,
        `${fieldName} is optional, user skipped uploading a file. ${
          originalFilenameLocation
            ? `Using ${originalFilenameLocation} instead`
            : ""
        }`
      );

      request.payload[fieldName] = originalFilenameLocation;
      continue;
    }

    const invalidFile = values.find(
      (value) => !uploadService.validateContentType(value, customAcceptedTypes)
    );

    if (invalidFile) {
      logger.error(
        loggerIdentifier,
        `User uploaded file with invalid content type or empty field for ${fieldName}, attempting to find previous upload`
      );

      if (!originalFilenameLocation) {
        logger.error(
          loggerIdentifier,
          `User uploaded invalid content type or empty field for ${fieldName}, and has no previous upload for field. Deleting ${fieldName} from payload`
        );
        delete request.payload[fieldName];
        erroredFields.push({ fieldName, customAcceptedTypes });
      }

      if (originalFilenameLocation) {
        logger.warn(
          loggerIdentifier,
          `User uploaded invalid content type or empty field for ${fieldName}, using existing upload ${originalFilenameLocation} instead`
        );
        request.payload[fieldName] = originalFilenameLocation;
      }

      continue;
    }

    validFields.push([fieldName, values]);
  }

  if (erroredFields) {
    request.pre.errors = erroredFields.map((field) => {
      const { fieldName, customAcceptedTypes } = field;
      return uploadService.invalidFileTypeError(fieldName, customAcceptedTypes);
    });
  }

  return validFields;
}
