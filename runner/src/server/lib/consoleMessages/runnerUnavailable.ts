import config from "server/config";

function runnerUnavailableAtRoute(path: string) {
  console.log(`**********
NOT FOUND: The ${path} route is not accessible:`);

  if (!config.previewMode) {
    console.log(
      `This is because the runner has config.previewMode set to false.`
    );
  } else {
    console.log(`Although config.previewMode is correctly set to true, it was
not possible to access the runner.`);
  }
  console.log(`

To enable publishing and previewing of forms on the runner, either:
- switch to development mode by setting NODE_ENV=development in your environment
- or, create a custom environment config with PREVIEW_MODE=true and ENFORCE_CSRF=false.
See runner/config/development.json for env defaults.

Your current environment settings:
-- env=${config.env.toString()}
-- enforceCsrf=${config.enforceCsrf.toString()}
-- previewMode=${config.previewMode.toString()}
**********`);
}

export { runnerUnavailableAtRoute };
