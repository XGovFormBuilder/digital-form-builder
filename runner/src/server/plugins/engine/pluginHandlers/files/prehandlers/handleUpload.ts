import { HapiRequest, HapiResponseToolkit } from "server/types";

const parsedError = (key: string, error?: string) => {
  return {
    path: key,
    href: `#${key}`,
    name: key,
    text: error,
  };
};

export async function handleUpload(
  request: HapiRequest,
  h: HapiResponseToolkit
) {
  const { cacheService, uploadService } = request.services([]);
  const state = await cacheService.getState(request);
  let originalFilenames = state?.originalFilenames ?? {};
  let logger = request.server.logger;
  const files = request.pre.files;

  if (!files) {
    return h.continue;
  }

  /**
   * files is an array of tuples containing key and value.
   * value may be an array of file data where multiple files have been uploaded
   */
  const validFiles = request.pre.validFiles;

  for (const entry of validFiles) {
    const [fieldName, streams] = entry;
    const loggerIdentifier = uploadService.getLoggerIdentifier(request, {
      fieldName,
    });
    const previousUpload = originalFilenames[fieldName];

    if (previousUpload) {
      logger.info(
        loggerIdentifier,
        `User is attempting to overwrite ${fieldName} with location ${previousUpload.location}`
      );
    }

    let response;
    let errors = new Set<any>();
    try {
      response = await uploadService.uploadDocuments(streams);
    } catch (err) {
      if (err.data?.res) {
        response = uploadService.parsedDocumentUploadResponse(err.data);
        errors.add(response.error);
      } else if (err.code === "EPIPE") {
        // ignore this error, it happens when the request is responded to by the doc upload service before the
        // body has finished being sent. A valid response is still received.
        logger.warn(loggerIdentifier, `Ignoring EPIPE response ${err.message}`);
      } else {
        logger.error(
          { ...loggerIdentifier, err },
          `Error uploading document: ${err.message}`
        );
        errors.add(err);
      }
    }

    const { location, warning, error } = response;

    if (location) {
      const originalFilename = streams
        .map((stream) => stream.hapi?.filename)
        .join(", ");

      logger.info(
        loggerIdentifier,
        `Uploaded ${fieldName} successfully to ${location}`
      );

      originalFilenames[fieldName] = { location, originalFilename };
      const {
        originalFilenames: updatedFilenames,
      } = await cacheService.mergeState(request, { originalFilenames });

      logger.info(
        { ...loggerIdentifier, allFiles: updatedFilenames },
        `Updated originalFileNames for user`
      );
      request.payload[fieldName] = location;
      originalFilenames = updatedFilenames;
    }

    if (warning) {
      request.pre.warning = warning;
      logger.warn(
        loggerIdentifier,
        `File was uploaded successfully but there was a warning ${warning}`
      );
    }

    if (error) {
      logger.error(
        loggerIdentifier,
        `Document upload API responded with an error ${error}`
      );
      errors.add(error)
    }

    if(errors.size > 0) {
      let errorsArray = Array.from(errors);
      request.pre.errors = [ 
        ...(h.request.pre.errors || []), 
        ...errorsArray.map(e => parsedError(fieldName, e)), ];
    }
  }

  return h.continue;
}
