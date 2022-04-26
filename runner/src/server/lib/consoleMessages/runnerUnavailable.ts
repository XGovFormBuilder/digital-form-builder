import config from "server/config";

function runnerUnavailableAtRoute() {
  let message = `
**********
NOT FOUND: This route is not accessible:`;

  if (!config.previewMode) {
    message += `This is because the runner has config.previewMode set to false.`;
  } else {
    message += `Although config.previewMode is correctly set to true, it was
not possible to access the runner.`;
  }
  message += `
Your current environment settings:
-- env=${config.env.toString()}
-- enforceCsrf=${config.enforceCsrf.toString()}
-- previewMode=${config.previewMode.toString()}
**********`;
  return message;
}

export { runnerUnavailableAtRoute };
