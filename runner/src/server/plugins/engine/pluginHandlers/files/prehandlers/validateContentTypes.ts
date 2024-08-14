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
  const erroredFields: string[] = [];
  const { originalFilenames = {} } = await cacheService.getState(request);

  for (const [fieldName, values] of files) {
    const invalidFile = values.find(
      (value) => !uploadService.validateContentType(value)
    );
    if (invalidFile) {
      logger.error(
        loggerIdentifier,
        `User uploaded file with invalid content type or empty field for ${fieldName}, attempting to find previous upload`
      );

      const originalFilename = originalFilenames[fieldName];
      if (!originalFilename) {
        logger.error(
          loggerIdentifier,
          `User uploaded invalid content type or empty field for ${fieldName}, and has no previous upload for field. Deleting ${fieldName} from payload`
        );
        delete request.payload[fieldName];
        erroredFields.push(fieldName);
      }

      if (originalFilename) {
        logger.warn(
          loggerIdentifier,
          `User uploaded invalid content type or empty field for ${fieldName}, using existing upload ${originalFilename.location} instead`
        );
        request.payload[fieldName] = originalFilename.location;
      }

      continue;
    }

    validFields.push([fieldName, values]);
  }

  if (erroredFields) {
    request.pre.hasInvalidContentTypes = true;
    request.pre.errors = erroredFields.map((field) =>
      uploadService.invalidFileTypeError(field)
    );
  }

  return validFields;
}
