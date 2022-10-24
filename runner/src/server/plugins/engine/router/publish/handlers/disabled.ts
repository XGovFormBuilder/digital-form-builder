import { HapiLifecycleMethod } from "server/types";
import Boom from "boom";

export const disabled: HapiLifecycleMethod = (request) => {
  request.logger.error(
    [`${request.method} ${request.url}`],
    "A request was made however previewing is disabled. See environment variable details in runner/README.md if this error is not expected."
  );
  throw Boom.forbidden("Publishing is disabled");
};
