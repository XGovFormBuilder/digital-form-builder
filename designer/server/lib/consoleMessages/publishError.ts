import config from "../../config";

function publishError() {
  return `**********
ERROR: Publishing and previewing forms is not possible currently, either because the runner is
not available at ${config.publishUrl.toString()} or if it is running, previewMode may be set to false on it.

To enable publishing and previewing of forms, ensure the runner is running in development mode.
You can do this by setting NODE_ENV=development in your environment, or see docs for more options.
**********`;
}

export { publishError };
