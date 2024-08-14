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
      uploadService.logger.info(
        loggerIdentifier,
        `User is attempting to overwrite ${fieldName} with location ${previousUpload.location}`
      );
    }

    let response;

    try {
      response = await uploadService.uploadDocuments(streams);
    } catch (err) {
      console.log("ERR", err);
      if (err.data?.res) {
        const { error } = uploadService.parsedDocumentUploadResponse(err.data);
        request.pre.errors = [
          ...request.pre.errors,
          parsedError(fieldName, error),
        ];
      } else if (err.code === "EPIPE") {
        // ignore this error, it happens when the request is responded to by the doc upload service before the
        // body has finished being sent. A valid response is still received.
        uploadService.logger.warn(
          loggerIdentifier,
          `Ignoring EPIPE response ${err.message}`
        );
      } else {
        uploadService.logger.error(
          { ...loggerIdentifier, err },
          `Error uploading document: ${err.message}`
        );
        request.pre.errors = [
          ...(h.request.pre.errors || []),
          parsedError(fieldName, err),
        ];
      }
    }

    const { location, warning, error } = response;

    if (location) {
      const originalFilename = streams
        .map((stream) => stream.hapi?.filename)
        .join(", ");

      uploadService.logger.info(
        loggerIdentifier,
        `Uploaded ${fieldName} successfully to ${location}`
      );

      originalFilenames[fieldName] = { location, originalFilename };
      const {
        originalFilenames: updatedFilenames,
      } = await cacheService.mergeState(request, { originalFilenames });

      uploadService.logger.info(
        { ...loggerIdentifier, allFiles: updatedFilenames },
        `Updated originalFileNames for user`
      );
      request.payload[fieldName] = location;
      originalFilenames = updatedFilenames;
    }

    if (warning) {
      request.pre.warning = warning;
      uploadService.logger.warn(
        loggerIdentifier,
        `File was uploaded successfully but there was a warning ${warning}`
      );
    }

    if (error) {
      uploadService.logger.error(
        loggerIdentifier,
        `Document upload API responded with an error ${error}`
      );
      request.pre.errors = [
        ...(request.pre.errors || []),
        parsedError(fieldName, error),
      ];
    }
  }

  return h.continue;
}
