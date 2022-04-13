import config from "../../config";

function publishError() {
  console.log(`**********
ERROR: Publishing and previewing forms is not possible currently, either because the runner is
not available at ${config.publishUrl.toString()} or if it is running, previewMode may be set to false on it.

To enable publishing and previewing of forms, ensure the runner is running in development mode 
by setting NODE_ENV=development in your environment and then re-starting the runner with: 
$>yarn runner start" +

You can alternatively create a custom environment by placing a custom myenvironment.json file
in the runner/config folder. Note: enforceCsrf must be set to false 
and previewMode must be set to true on the runner for the designer to work
See runner/config/development.json for example dev defaults.
**********`);
}

export { publishError };
